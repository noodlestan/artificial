import { parse, postprocess, preprocess } from 'micromark';

import type {
	BlockContent,
	Document,
	FieldBlock,
	NaturalBlock,
	Point,
	Position,
	SectionBlock,
	Tag,
} from './types';

const TAG_PATTERN = /\(#([\w-]+)\)/g;
const KIND_PATTERN = /^([\w-]+):\s*(.+)$/;
const FIELD_PATTERN = /^([\w-]+):/;

interface OpenSection {
	block: SectionBlock;
	level: number;
	parent: Document | SectionBlock;
}

function extractTags(text: string): Tag[] {
	const tags: Tag[] = [];
	for (const match of text.matchAll(TAG_PATTERN)) {
		tags.push({ construct: 'Tag', name: match[1] });
	}
	return tags;
}

function headingLevel(markdown: string, start: number, end: number): number {
	const match = markdown.slice(start, end).match(/^[ \t]*#+/);
	return match ? match[0].replace(/[ \t]/g, '').length : 1;
}

function stripStrong(span: string): string {
	if (span.length >= 4 && span.startsWith('**') && span.endsWith('**')) {
		return span.slice(2, -2);
	}
	if (span.length >= 4 && span.startsWith('__') && span.endsWith('__')) {
		return span.slice(2, -2);
	}
	return span;
}

/**
 * Turns a micromark token event stream into schema-typed records, following the
 * construct-stack pattern: enter/exit hooks per token type plus an explicit
 * stack of open records.
 */
export function buildDocument(markdown: string): Document {
	const document: Document = {
		construct: 'Document',
		children: [],
	};

	const sections: OpenSection[] = [];
	const fields: FieldBlock[] = [];

	let pendingText = '';
	let pendingStart: Point | undefined;
	let pendingEnd: Point | undefined;

	let skipInnerDepth = 0;
	let inHeading = false;
	let inFieldStrong = false;
	let fieldColonRemainder = '';
	let fieldPosition: Position | undefined;

	let pendingSectionOpen = false;
	let pendingSectionParent: Document | SectionBlock = document;
	let pendingSectionLevel = 1;
	let headingText: string | undefined;
	let headingPosition: Position | undefined;

	const currentChildren = (): BlockContent[] => {
		const field = fields[fields.length - 1];
		if (field) return field.value;
		const section = sections[sections.length - 1];
		if (section) return section.block.children;
		return document.children;
	};

	const nearestSection = (): SectionBlock | undefined => sections[sections.length - 1]?.block;

	const appendSource = (start: Point, end: Point): void => {
		if (!pendingStart) pendingStart = start;
		pendingEnd = end;
		pendingText += markdown.slice(start.offset, end.offset);
	};

	const flushText = (): void => {
		const text = pendingText.trim();
		if (text) {
			const tags = extractTags(text);
			const section = nearestSection();
			if (tags.length > 0 && section) {
				(section.tags ??= []).push(...tags);
			}
			const block: NaturalBlock = { construct: 'NaturalBlock', value: text };
			if (pendingStart && pendingEnd) {
				block.position = { start: pendingStart, end: pendingEnd };
			}
			currentChildren().push(block);
		}
		pendingText = '';
		pendingStart = undefined;
		pendingEnd = undefined;
	};

	const closeOpenField = (): void => {
		if (fields.length > 0) {
			flushText();
			fields.pop();
		}
	};

	const closeSections = (minLevel: number): void => {
		while (sections.length > 0 && sections[sections.length - 1].level >= minLevel) {
			const open = sections.pop() as OpenSection;
			open.parent.children.push(open.block);
		}
	};

	const preprocessed = preprocess()(markdown, undefined, true);
	const doc = parse().document();
	doc.write(preprocessed);
	const events = postprocess(doc.events);

	for (const [phase, token] of events) {
		if (phase === 'enter') {
			switch (token.type) {
				case 'atxHeading': {
					closeOpenField();
					flushText();
					inHeading = true;
					skipInnerDepth++;
					headingPosition = { start: token.start, end: token.end };
					const level = headingLevel(markdown, token.start.offset, token.end.offset);
					closeSections(level);
					pendingSectionParent = sections[sections.length - 1]?.block ?? document;
					pendingSectionLevel = level;
					pendingSectionOpen = true;
					break;
				}
				case 'atxHeadingText': {
					headingText = markdown.slice(token.start.offset, token.end.offset);
					if (pendingSectionOpen) {
						const rawText = headingText.trim();
						const tags = extractTags(rawText);
						const textWithoutTags = rawText.replace(TAG_PATTERN, ' ').trim();
						const kindMatch = textWithoutTags.match(KIND_PATTERN);
						const section: SectionBlock = {
							construct: 'SectionBlock',
							name: kindMatch ? kindMatch[2].trim() : textWithoutTags,
							children: [],
						};
						if (kindMatch) section.kind = kindMatch[1];
						if (tags.length > 0) section.tags = tags;
						if (headingPosition) section.position = headingPosition;
						sections.push({
							block: section,
							level: pendingSectionLevel,
							parent: pendingSectionParent,
						});
						pendingSectionOpen = false;
					}
					break;
				}
				case 'strong': {
					if (inHeading) {
						skipInnerDepth++;
						break;
					}
					const span = markdown.slice(token.start.offset, token.end.offset);
					const inner = stripStrong(span);
					const fieldMatch = inner.match(FIELD_PATTERN);
					if (fieldMatch) {
						closeOpenField();
						flushText();
						const field: FieldBlock = {
							construct: 'FieldBlock',
							name: fieldMatch[1],
							value: [],
							position: { start: token.start, end: token.end },
						};
						currentChildren().push(field);
						fields.push(field);
						inFieldStrong = true;
						fieldColonRemainder = inner.slice(fieldMatch[0].length);
						fieldPosition = { start: token.start, end: token.end };
					} else {
						appendSource(token.start, token.end);
						skipInnerDepth++;
					}
					break;
				}
				case 'codeFenced':
				case 'codeIndented':
				case 'codeText':
				case 'link':
				case 'autolink': {
					if (inHeading) {
						skipInnerDepth++;
						break;
					}
					appendSource(token.start, token.end);
					skipInnerDepth++;
					break;
				}
				case 'data':
				case 'lineEnding': {
					if (!inFieldStrong && skipInnerDepth === 0) {
						appendSource(token.start, token.end);
					}
					break;
				}
			}
		} else {
			switch (token.type) {
				case 'atxHeading': {
					if (skipInnerDepth > 0) skipInnerDepth--;
					inHeading = false;
					headingText = undefined;
					headingPosition = undefined;
					pendingSectionOpen = false;
					break;
				}
				case 'strong': {
					if (inFieldStrong) {
						inFieldStrong = false;
						if (fieldColonRemainder) {
							if (!pendingStart && fieldPosition) pendingStart = fieldPosition.start;
							if (fieldPosition) pendingEnd = fieldPosition.end;
							pendingText += fieldColonRemainder;
						}
						fieldColonRemainder = '';
						fieldPosition = undefined;
					} else if (skipInnerDepth > 0) {
						skipInnerDepth--;
					}
					break;
				}
				case 'codeFenced':
				case 'codeIndented':
				case 'codeText':
				case 'link':
				case 'autolink': {
					if (skipInnerDepth > 0) skipInnerDepth--;
					break;
				}
				case 'paragraph': {
					flushText();
					break;
				}
			}
		}
	}

	closeOpenField();
	flushText();
	closeSections(0);

	return document;
}
