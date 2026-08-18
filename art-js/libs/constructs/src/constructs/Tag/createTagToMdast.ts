import type { Node } from 'mdast';

import type { ConstructToMdast } from '../types';

import type { Tag } from './private/types';

export function createTagToMdast(): ConstructToMdast {
	return {
		construct: 'Tag',
		toMdast(node) {
			const tag = node as unknown as Tag;
			return {
				type: 'text',
				value: `@${tag.name}`,
			} as Node;
		},
	};
}
