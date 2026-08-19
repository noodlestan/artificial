import type { Paragraph, Strong } from 'mdast';

import type { ConstructCreator } from '../../types';

import { createFieldBlockFromParagraph } from './createFieldBlockFromParagraph';
import { isFieldStrong } from './isFieldStrong';
import { stripStrong } from './stripStrong';
export function createFieldBlockCreator(): ConstructCreator {
	return {
		detect: (node, context) => {
			if (
				node.type === 'paragraph' &&
				node.children[0] !== undefined &&
				isFieldStrong(node.children[0], context)
			) {
				const strong = node.children[0] as Strong;
				const inner = stripStrong(strong, context);
				const colonIndex = inner.indexOf(':');
				const remainder = inner.slice(colonIndex + 1);
				return remainder.trim().length === 0;
			}
			return false;
		},
		create: (node, context) => createFieldBlockFromParagraph(node as Paragraph, context),
		shouldVisit: false,
	};
}
