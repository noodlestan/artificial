import type { Node } from 'mdast';

import type { ConstructToMdast } from '../types';

export function createDocumentToMdast(): ConstructToMdast {
	return {
		construct: 'Document',
		toMdast(_node, children) {
			return {
				type: 'root',
				children,
			} as Node;
		},
	};
}
