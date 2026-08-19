import type { Paragraph } from 'mdast';

import type { Construct } from '../../../registry';
import type { ConstructPreProcessor } from '../../types';

import { createFieldBlockFromParagraph } from './createFieldBlockFromParagraph';
import { isFieldStrong } from './isFieldStrong';
import { stripStrong } from './stripStrong';
export function createFieldBlockPreProcessor(): ConstructPreProcessor {
	return {
		canPreProcess(node, context) {
			if (node.type === 'paragraph') {
				const first = (node as Paragraph).children[0];
				if (first !== undefined && isFieldStrong(first, context)) {
					const strong = first as import('mdast').Strong;
					const inner = stripStrong(strong, context);
					const colonIndex = inner.indexOf(':');
					const remainder = inner.slice(colonIndex + 1);
					return remainder.trim().length === 0;
				}
			}
			return false;
		},
		preProcess(node, context) {
			return createFieldBlockFromParagraph(node as Paragraph, context) as Construct;
		},
	};
}
