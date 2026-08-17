import type { Paragraph } from 'mdast';

import type { ConstructCreator } from '../../types';

import { createFieldBlockFromParagraph } from './createFieldBlockFromParagraph';
import { isFieldStrong } from './isFieldStrong';
export function createFieldBlockCreator(): ConstructCreator {
	return {
		detect: (node, context) =>
			node.type === 'paragraph' &&
			node.children[0] !== undefined &&
			isFieldStrong(node.children[0], context),
		create: (node, context) => createFieldBlockFromParagraph(node as Paragraph, context),
		shouldVisit: false,
	};
}
