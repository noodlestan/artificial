import type { FieldBlock, NaturalBlock, SectionBlock, Tag } from '@art-js/artificial-primitives';
import type { Heading, List, Paragraph, Strong, Text } from 'mdast';

import { cleanPosition, rawSlice } from './helpers';
import type { ConstructFactory, MdastNode, VisitContext } from './types';

const FIELD_TEXT_PATTERN = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;
const TAG_PATTERN = /\(#([\w-]+)\)/g;
const KIND_PATTERN = /^([\w-]+(?: [\w-]+)*):\s*(.+)$/;

function stripStrong(node: Strong, context: VisitContext): string {
	const raw = rawSlice(node, context);
	return raw.length >= 4 &&
		((raw.startsWith('**') && raw.endsWith('**')) || (raw.startsWith('__') && raw.endsWith('__')))
		? raw.slice(2, -2)
		: raw;
}

export function isFieldStrong(node: MdastNode, context: VisitContext): node is Strong {
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node, context));
}

export function createNaturalBlock(node: MdastNode, context: VisitContext): NaturalBlock {
	const block: NaturalBlock = {
		construct: 'NaturalBlock',
		...node,
		value: rawSlice(node, context),
		position: cleanPosition(node.position),
	};
	if (node.type === 'code') {
		block.lang = node.lang ?? null;
		block.meta = node.meta ?? null;
	} else if (node.type === 'list') {
		block.children = [];
		for (const item of (node as List).children) {
			const content = item.children.find(child => child.type === 'paragraph');
			if (content)
				block.children.push({
					construct: 'NaturalBlock',
					value: rawSlice(content, context).trim(),
					position: cleanPosition(content.position),
				});
		}
	} else if (node.type === 'blockquote') {
		block.children = node.children.map((child: MdastNode) => createNaturalBlock(child, context));
	}
	return block;
}

export const naturalBlockFactory: ConstructFactory = {
	detect: () => true,
	create: (node, context) => createNaturalBlock(node, context),
	shouldVisit: false,
};

export function createFieldBlockFromParagraph(
	paragraph: Paragraph,
	context: VisitContext,
): FieldBlock {
	const strong = paragraph.children[0] as Strong;
	const inner = stripStrong(strong, context);
	const colonIndex = inner.indexOf(':');
	const field: FieldBlock = {
		construct: 'FieldBlock',
		name: inner.slice(0, colonIndex).trim(),
		value: [],
		position: cleanPosition(paragraph.position),
	};
	const remainder = inner.slice(colonIndex + 1);
	if (remainder)
		field.value.push({
			construct: 'NaturalBlock',
			type: 'text',
			value: remainder.trim(),
			position: cleanPosition(strong.position),
		});
	for (const child of paragraph.children.slice(1))
		field.value.push(createNaturalBlock(child, context));
	return field;
}

export const fieldBlockFactory: ConstructFactory = {
	detect: (node, context) =>
		node.type === 'paragraph' &&
		node.children[0] !== undefined &&
		isFieldStrong(node.children[0], context),
	create: (node, context) => createFieldBlockFromParagraph(node as Paragraph, context),
	shouldVisit: false,
};

export const sectionBlockFactory: ConstructFactory = {
	detect: node => node.type === 'heading',
	create: (node, context) => {
		const heading = node as Heading;
		const text = rawSlice(heading, context)
			.replace(/^[ \t]*#+[ \t]*/, '')
			.trim();
		const tags: Tag[] = [...text.matchAll(TAG_PATTERN)]
			.map(match => ({ construct: 'Tag' as const, name: match[1] ?? '' }))
			.filter(tag => tag.name);
		const textWithoutTags = text.replace(TAG_PATTERN, '').trim();
		const kindMatch = textWithoutTags.match(KIND_PATTERN);
		const section: SectionBlock = {
			construct: 'SectionBlock',
			name: kindMatch?.[2]?.trim() ?? textWithoutTags,
			children: [],
			depth: heading.depth,
			position: cleanPosition(heading.position),
		};
		if (kindMatch?.[1]) section.kind = kindMatch[1];
		if (tags.length) section.tags = tags;
		return section;
	},
	shouldVisit: false,
};

export const tagFactory: ConstructFactory = {
	detect: node => node.type === 'text' && TAG_PATTERN.test((node as Text).value),
	create: node => {
		const text = node as Text;
		TAG_PATTERN.lastIndex = 0;
		return [...text.value.matchAll(TAG_PATTERN)].map(match => ({
			construct: 'Tag' as const,
			name: match[1] ?? '',
			position: cleanPosition(text.position),
		}));
	},
	shouldVisit: false,
};
