import type { Node } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';

import type { ConstructToMdast } from '../types';

import type { NaturalBlock } from './private/types';

export function createNaturalBlockToMdast(): ConstructToMdast {
	return {
		construct: 'NaturalBlock',
		toMdast(node) {
			const block = node as unknown as NaturalBlock;
			const parsed = fromMarkdown(block.value);
			return {
				type: 'root',
				children: parsed.children,
			} as Node;
		},
	};
}
