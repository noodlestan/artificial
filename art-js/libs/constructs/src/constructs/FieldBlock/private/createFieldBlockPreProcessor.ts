import type { Paragraph } from 'mdast';

import type { Construct } from '../../../registry';
import type { ConstructPreProcessor } from '../../types';

import { createFieldBlockFromParagraph } from './createFieldBlockFromParagraph';
import { isFieldStrong } from './isFieldStrong';
import { stripStrong } from './stripStrong';
export function createFieldBlockPreProcessor(): ConstructPreProcessor {
	return {
		preProcess(node, context) {
			if (node.type !== 'paragraph') return null;
			const paragraph = node as Paragraph;
			const first = paragraph.children[0];
			if (first === undefined || !isFieldStrong(first, context)) return null;
			const strong = first as import('mdast').Strong;
			const inner = stripStrong(strong, context);
			const colonIndex = inner.indexOf(':');
			const remainder = inner.slice(colonIndex + 1);
			if (remainder.trim().length > 0) return null;
			return createFieldBlockFromParagraph(node as Paragraph, context) as Construct;
		},
	};
}
