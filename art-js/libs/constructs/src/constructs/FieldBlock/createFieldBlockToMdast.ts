import type { Node } from 'mdast';

import type { ConstructToMdast } from '../types';

import type { FieldBlock } from './private/types';

export function createFieldBlockToMdast(): ConstructToMdast {
	return {
		construct: 'FieldBlock',
		toMdast(node, children) {
			const field = node as unknown as FieldBlock;
			return {
				type: 'paragraph',
				children: [
					{
						type: 'strong',
						children: [{ type: 'text', value: `${field.name}:` }],
					},
					{ type: 'text', value: ' ' },
					...children,
				],
			} as Node;
		},
	};
}
