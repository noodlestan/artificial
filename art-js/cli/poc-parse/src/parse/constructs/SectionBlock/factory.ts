import type { Heading } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import type { ConstructFactory } from '../../framework/getFactory';
import { rawSlice } from '../../framework/rawSlice';
import type { SectionBlock, Tag } from '../../types';

const TAG_PATTERN_G = /\(#([\w-]+)\)/g;
const KIND_PATTERN = /^([\w-]+(?: [\w-]+)*):\s*(.+)$/;

function extractTags(text: string): Tag[] {
	const tags: Tag[] = [];
	for (const match of text.matchAll(TAG_PATTERN_G)) {
		tags.push({ construct: 'Tag', name: match[1] });
	}
	return tags;
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
	shouldVisit: false,
};
