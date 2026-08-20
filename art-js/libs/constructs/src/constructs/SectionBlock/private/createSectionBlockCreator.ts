import type { Heading } from 'mdast';

import { cleanPosition } from '../../../helpers/cleanPosition';
import { rawSlice } from '../../../helpers/rawSlice';
import type { Tag } from '../../Tag/private/types';
import type { ConstructCreator } from '../../types';

import { KIND_PATTERN, TAG_PATTERN } from './constants';
import type { SectionBlock } from './types';

export function createSectionBlockCreator(): ConstructCreator {
	return {
		detect: node => node.type === 'heading',
		create: (node, context) => {
			const heading = node as Heading;
			const text = rawSlice(heading, context)
				.replace(/^[ \t]*#+[ \t]*/, '')
				.trim();
			const tags: Tag[] = [...text.matchAll(TAG_PATTERN)]
				.map(match => ({
					construct: 'Tag' as const,
					name: match[1] ?? '',
				}))
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
	};
}
