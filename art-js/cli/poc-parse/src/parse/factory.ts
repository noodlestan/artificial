import type { Heading, List, Nodes, Paragraph, Strong, Text } from 'mdast';
import type { Node, Position as UnistPosition } from 'unist';

import type {
	BlockContent,
	Construct,
	FieldBlock,
	NaturalBlock,
	Point,
	Position,
	SectionBlock,
	Tag,
} from './types';

export type MdastNode = Node;

export interface VisitContext {
	capturing(): string | undefined;
	target(): BlockContent[];
	push(record: Construct): void;
	parent(): VisitContext | undefined;
	source: string;
	lastEnd: Point | undefined;
	_section?: SectionBlock;
}

export interface ConstructFactory {
	detect(node: MdastNode, context: VisitContext): boolean;
	create(node: MdastNode, context: VisitContext): Construct;
	visitChildren: boolean;
}

const TAG_PATTERN = /\(#([\w-]+)\)/;
const TAG_PATTERN_G = /\(#([\w-]+)\)/g;
const KIND_PATTERN = /^([\w-]+(?: [\w-]+)*):\s*(.+)$/;
const FIELD_TEXT_PATTERN = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;

const INLINE_TYPES = new Set([
	'text',
	'emphasis',
	'strong',
	'delete',
	'html',
	'inlineCode',
	'break',
	'image',
	'imageReference',
	'link',
	'linkReference',
	'footnoteReference',
]);

export function cleanPosition(raw: UnistPosition | undefined): Position | undefined {
	if (!raw?.start || !raw.end) return undefined;
	return {
		start: { line: raw.start.line, column: raw.start.column, offset: raw.start.offset ?? 0 },
		end: { line: raw.end.line, column: raw.end.column, offset: raw.end.offset ?? 0 },
	};
}

function rawSlice(node: MdastNode, context: VisitContext): string {
	if (!node.position?.start || !node.position?.end) return '';
	return context.source.slice(node.position.start.offset, node.position.end.offset);
}

function stripStrong(node: Strong, context: VisitContext): string {
	const raw = rawSlice(node, context);
	if (raw.length >= 4 && raw.startsWith('**') && raw.endsWith('**')) return raw.slice(2, -2);
	if (raw.length >= 4 && raw.startsWith('__') && raw.endsWith('__')) return raw.slice(2, -2);
	return raw;
}

function extractTags(text: string): Tag[] {
	const tags: Tag[] = [];
	for (const match of text.matchAll(TAG_PATTERN_G)) {
		tags.push({ construct: 'Tag', name: match[1] });
	}
	return tags;
}

function isFieldStrong(node: Nodes, context: VisitContext): node is Strong {
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
}

export function isInlineNode(node: MdastNode): boolean {
	return INLINE_TYPES.has(node.type);
}

export function findTagable(context: VisitContext): SectionBlock | undefined {
	let current: VisitContext | undefined = context;
	while (current) {
		if (current._section) return current._section;
		current = current.parent();
	}
	return undefined;
}

export function sectionDepth(section: SectionBlock): number {
	return section.depth ?? 1;
}

export function createNaturalBlock(node: MdastNode, context: VisitContext): NaturalBlock {
	const block: NaturalBlock = {
		construct: 'NaturalBlock',
		...(node as unknown as Record<string, unknown>),
		value: rawSlice(node, context),
		position: cleanPosition(node.position),
	};

	if (node.type === 'code') {
		const code = node as unknown as { lang?: string | null; meta?: string | null };
		block.lang = code.lang ?? null;
		block.meta = code.meta ?? null;
	} else if (node.type === 'list') {
		const list = node as List;
		block.children = [];
		for (const item of list.children) {
			const content = item.children.find(child => child.type === 'paragraph');
			if (content) {
				block.children.push({
					construct: 'NaturalBlock',
					value: rawSlice(content, context).trim(),
					position: cleanPosition(content.position),
				});
			}
		}
	} else if (node.type === 'blockquote') {
		const bq = node as unknown as { children: MdastNode[] };
		block.children = bq.children.map(child => createNaturalBlock(child, context));
	}

	return block;
}

export function createFieldBlockFromParagraph(
	paragraph: Paragraph,
	context: VisitContext,
): FieldBlock {
	const strong = paragraph.children[0] as Strong;
	const inner = stripStrong(strong, context);
	const colonIndex = inner.indexOf(':');
	const name = inner.slice(0, colonIndex).trim();

	const field: FieldBlock = {
		construct: 'FieldBlock',
		name,
		value: [],
		position: cleanPosition(paragraph.position),
	};

	const remainder = inner.slice(colonIndex + 1);
	if (remainder) {
		field.value.push({
			construct: 'NaturalBlock',
			type: 'text',
			value: remainder.trim(),
			position: cleanPosition(strong.position),
		});
	}

	for (const child of paragraph.children.slice(1)) {
		field.value.push(createNaturalBlock(child, context));
	}

	return field;
}

export const sectionBlockFactory: ConstructFactory = {
	detect(node) {
		return node.type === 'heading';
	},
	create(node, context) {
		const heading = node as Heading;
		const text = rawSlice(heading, context)
			.replace(/^[ \t]*#+[ \t]*/, '')
			.trim();
		const tags = extractTags(text);
		const textWithoutTags = text.replace(TAG_PATTERN_G, '').trim();
		const kindMatch = textWithoutTags.match(KIND_PATTERN);
		const section: SectionBlock = {
			construct: 'SectionBlock',
			name: kindMatch ? kindMatch[2].trim() : textWithoutTags,
			children: [],
			depth: heading.depth,
		};
		if (kindMatch) section.kind = kindMatch[1];
		if (tags.length > 0) section.tags = tags;
		section.position = cleanPosition(heading.position);
		return section;
	},
	visitChildren: false,
};

export const fieldBlockFactory: ConstructFactory = {
	detect(node, context) {
		if (node.type === 'paragraph') {
			const first = (node as Paragraph).children[0];
			return first !== undefined && isFieldStrong(first, context);
		}
		return false;
	},
	create(node, context) {
		return createFieldBlockFromParagraph(node as Paragraph, context);
	},
	visitChildren: false,
};

export const tagFactory: ConstructFactory = {
	detect(node) {
		return node.type === 'text' && TAG_PATTERN.test((node as Text).value);
	},
	create(node) {
		const text = node as Text;
		const match = text.value.match(TAG_PATTERN);
		const tag: Tag = {
			construct: 'Tag',
			name: match ? match[1] : '',
		};
		tag.position = cleanPosition(text.position);
		return tag;
	},
	visitChildren: false,
};

export const naturalBlockFactory: ConstructFactory = {
	detect() {
		return true;
	},
	create(node, context) {
		return createNaturalBlock(node, context);
	},
	visitChildren: false,
};

export interface ConstructHandler {
	canHandle(record: Construct): boolean;
	handle(record: Construct, node: MdastNode, context: VisitContext): VisitContext;
}

export function createSectionBlockHandler(
	createNestedCtx: typeof createNestedContext,
): ConstructHandler {
	return {
		canHandle(record) {
			return record.construct === 'SectionBlock';
		},
		handle(record, node, context) {
			const section = record as SectionBlock;
			let ctx = context;

			if (ctx.capturing() === 'FieldBlock') {
				const p = ctx.parent();
				if (p) {
					p.lastEnd = ctx.lastEnd;
					ctx = p;
				}
			}

			const heading = node as unknown as { depth: number };
			while (ctx.capturing() === 'SectionBlock') {
				const parentSection = findTagable(ctx);
				if (parentSection && sectionDepth(parentSection) >= heading.depth) {
					const p = ctx.parent();
					if (p) {
						p.lastEnd = ctx.lastEnd;
						ctx = p;
					}
				} else {
					break;
				}
			}

			ctx.push(record);
			const newCtx = createNestedCtx('SectionBlock', ctx, undefined, section.children, section);
			newCtx.lastEnd = ctx.lastEnd;
			return newCtx;
		},
	};
}

export function createFieldBlockHandler(
	createNestedCtx: typeof createNestedContext,
): ConstructHandler {
	return {
		canHandle(record) {
			return record.construct === 'FieldBlock';
		},
		handle(record, node, context) {
			const field = record as FieldBlock;
			let ctx = context;

			if (ctx.capturing() === 'FieldBlock') {
				const p = ctx.parent();
				if (p) {
					p.lastEnd = ctx.lastEnd;
					ctx = p;
				}
			}

			ctx.push(record);
			const newCtx = createNestedCtx('FieldBlock', ctx, undefined, field.value);
			newCtx.lastEnd = ctx.lastEnd;
			return newCtx;
		},
	};
}

export function getFactory(node: MdastNode, context: VisitContext): ConstructFactory | null {
	if (sectionBlockFactory.detect(node, context)) return sectionBlockFactory;
	if (fieldBlockFactory.detect(node, context)) return fieldBlockFactory;
	if (tagFactory.detect(node, context)) return tagFactory;
	return null;
}

export function createNestedContext(
	structure: string,
	parentContext: VisitContext | undefined,
	source?: string,
	targetArray?: BlockContent[],
	section?: SectionBlock,
): VisitContext {
	const children = targetArray ?? [];

	const ctx: VisitContext = {
		capturing() {
			return structure;
		},
		target() {
			return children;
		},
		push(record: Construct) {
			if (record.construct === 'Tag') {
				const s = findTagable(ctx);
				if (s) (s.tags ??= []).push(record);
				return;
			}
			children.push(record);
		},
		parent() {
			return parentContext;
		},
		source: source ?? parentContext?.source ?? '',
		lastEnd: parentContext?.lastEnd,
		_section: section,
	};

	return ctx;
}

export function createDocumentContext(source: string): VisitContext {
	return createNestedContext('Document', undefined, source);
}
