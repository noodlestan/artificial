import type { Heading } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import { rawSlice } from '../../framework/rawSlice';
import type { ConstructFactory } from '../../framework/types';
import type { SectionBlock } from '../../types';

import { KIND_PATTERN, TAG_PATTERN_G } from './constants';
import { extractTags } from './private/extractTags';

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
		const name = kindMatch && kindMatch[2] ? kindMatch[2].trim() : textWithoutTags;
		const section: SectionBlock = {
			construct: 'SectionBlock',
			name,
			children: [],
			depth: heading.depth,
		};
		if (kindMatch && kindMatch[1]) section.kind = kindMatch[1];
		if (tags.length > 0) section.tags = tags;
		section.position = cleanPosition(heading.position);
		return section;
	},
	shouldVisit: false,
};
