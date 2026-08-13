import type { Paragraph } from 'mdast';

import type { MdastNode, VisitContext } from '../../framework/createNestedContext';
import type { Construct } from '../../types';

import { createFieldBlockFromParagraph, isFieldStrong } from './factory';

export interface ConstructPreProcessor {
	canPreProcess(node: MdastNode, context: VisitContext): boolean;
	preProcess(node: MdastNode, context: VisitContext): Construct | null;
}

export function createFieldDetectionPreProcessor(): ConstructPreProcessor {
	return {
		canPreProcess(node, context) {
			if (node.type === 'paragraph') {
				const first = (node as Paragraph).children[0];
				return first !== undefined && isFieldStrong(first, context);
			}
			return false;
		},
		preProcess(node, context) {
			return createFieldBlockFromParagraph(node as Paragraph, context);
		},
	};
}
