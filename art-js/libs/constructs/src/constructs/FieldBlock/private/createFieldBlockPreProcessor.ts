import type { Paragraph } from 'mdast';

import type { Construct } from '../../../registry';
import type { ConstructPreProcessor } from '../../types';

import { createFieldBlockFromParagraph } from './createFieldBlockFromParagraph';
import { isFieldStrong } from './isFieldStrong';
export function createFieldBlockPreProcessor(): ConstructPreProcessor {
	return {
		canPreProcess(node, context) {
			if (node.type === 'paragraph') {
				const first = (node as Paragraph).children[0];
				return first !== undefined && isFieldStrong(first, context);
			}
			return false;
		},
		preProcess(node, context) {
			return createFieldBlockFromParagraph(node as Paragraph, context) as Construct;
		},
	};
}
