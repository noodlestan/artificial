import type { Node } from 'mdast';

import type { ConstructToMdast } from '../types';

import type { SectionBlock } from './private/types';

export function createSectionBlockToMdast(): ConstructToMdast {
	return {
		construct: 'SectionBlock',
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		toMdast(node, _children) {
			const section = node as unknown as SectionBlock;
			const depth = section.depth ?? 1;
			return {
				type: 'heading',
				depth: depth as 1 | 2 | 3 | 4 | 5 | 6,
				children: [{ type: 'text', value: section.name }],
			} as Node;
		},
	};
}
