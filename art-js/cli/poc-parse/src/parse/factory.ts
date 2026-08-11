import type { Heading, List, Nodes, Paragraph, Strong, Text } from 'mdast';
import type { Node, Position as UnistPosition } from 'unist';

import type {
	BlockContent,
	Construct,
	FieldBlock,
	NaturalBlock,
	Position,
	SectionBlock,
	Tag,
} from './types';

/** A node in the mdast tree, as consumed by the construct factories. */
export type MdastNode = Node;

/** Shared parsing context threaded through the factory pipeline. */
export interface VisitContext {
	sectionStack: SectionBlock[];
	documentChildren: BlockContent[];
	/** Source markdown, used to slice lossless raw text from node positions. */
	source: string;
}

/** Maps an mdast node to a construct record. */
export interface ConstructFactory {
	/** Can this mdast node be mapped to our construct? */
	detect(node: MdastNode, context: VisitContext): boolean;
	/** Create the construct record from the mdast node. */
	create(node: MdastNode, context: VisitContext): Construct;
	/** Should we visit the node's children after creating the record? */
	visitChildren: boolean;
}

const TAG_PATTERN = /\(#([\w-]+)\)/;
const TAG_PATTERN_G = /\(#([\w-]+)\)/g;
const KIND_PATTERN = /^([\w-]+(?: [\w-]+)*):\s*(.+)$/;
const FIELD_TEXT_PATTERN = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;

/**
 * Strip micromark-internal fields (`_bufferIndex`, `_index`) from a position
 * record, keeping only `line`, `column`, `offset`.
 */
export function cleanPosition(raw: UnistPosition | undefined): Position | undefined {
	if (!raw?.start || !raw.end) return undefined;
	return {
		start: { line: raw.start.line, column: raw.start.column, offset: raw.start.offset ?? 0 },
		end: { line: raw.end.line, column: raw.end.column, offset: raw.end.offset ?? 0 },
	};
}

/** The raw markdown span of a node, sliced verbatim from the source. */
function rawSlice(node: MdastNode, context: VisitContext): string {
	if (!node.position?.start || !node.position?.end) return '';
	return context.source.slice(node.position.start.offset, node.position.end.offset);
}

/** The text inside a strong span, without the `**`/`__` delimiters. */
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
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node, context));
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
		};
		if (kindMatch) section.kind = kindMatch[1];
		if (tags.length > 0) section.tags = tags;
		section.position = cleanPosition(heading.position);
		return section;
	},
	// The heading's own inline text is captured by `create`; the content under
	// the heading is a sibling traversal, which `visit.SKIP` does not interrupt.
	visitChildren: false,
};

export const fieldBlockFactory: ConstructFactory = {
	detect(node, context) {
		if (node.type === 'strong') {
			return FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
		}
		if (node.type === 'paragraph') {
			const first = (node as Paragraph).children[0];
			return first !== undefined && isFieldStrong(first, context);
		}
		return false;
	},
	create(node, context) {
		const paragraph = node.type === 'paragraph' ? (node as Paragraph) : undefined;
		const strong = paragraph ? (paragraph.children[0] as Strong) : (node as Strong);
		const inner = stripStrong(strong, context);
		const colonIndex = inner.indexOf(':');
		const name = inner.slice(0, colonIndex).trim();
		const field: FieldBlock = {
			construct: 'FieldBlock',
			name,
			value: [],
			position: cleanPosition(node.position),
		};
		const pieces: string[] = [];
		const remainder = inner.slice(colonIndex + 1);
		if (remainder) pieces.push(remainder);
		if (paragraph) {
			for (const child of paragraph.children.slice(1)) {
				pieces.push(rawSlice(child, context));
			}
		}
		const value = pieces.join('').trim();
		if (value) {
			const block: NaturalBlock = { construct: 'NaturalBlock', value };
			if (paragraph && paragraph.children.length > 1) {
				const start = paragraph.children[1].position?.start;
				const end = paragraph.children[paragraph.children.length - 1].position?.end;
				if (start && end) block.position = cleanPosition({ start, end });
			} else {
				block.position = cleanPosition(strong.position);
			}
			field.value.push(block);
		}
		return field;
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
		const block: NaturalBlock = {
			construct: 'NaturalBlock',
			value: rawSlice(node, context),
		};
		block.position = cleanPosition(node.position);
		if (node.type === 'list') {
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
		}
		return block;
	},
	visitChildren: false,
};

/**
 * Returns the matching factory for a node — SectionBlock, then FieldBlock,
 * then Tag — or `null` for the NaturalBlock fallback.
 */
export function getFactory(node: MdastNode, context: VisitContext): ConstructFactory | null {
	if (sectionBlockFactory.detect(node, context)) return sectionBlockFactory;
	if (fieldBlockFactory.detect(node, context)) return fieldBlockFactory;
	if (tagFactory.detect(node, context)) return tagFactory;
	return null;
}
