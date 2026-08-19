import type { Paragraph } from 'mdast';

import { cleanPosition } from '../../helpers/cleanPosition';
import type { Construct } from '../../registry';
import { isFieldStrong } from '../FieldBlock/private/isFieldStrong';
import { stripStrong } from '../FieldBlock/private/stripStrong';
import type { ConstructPreProcessor } from '../types';

import type { FieldInline } from './private/types';

export function createFieldInlinePreProcessor(): ConstructPreProcessor {
	return {
		canPreProcess(node, context) {
			if (node.type === 'paragraph') {
				const first = (node as Paragraph).children[0];
				if (first !== undefined && isFieldStrong(first, context)) {
					const strong = first as import('mdast').Strong;
					const inner = stripStrong(strong, context);
					const colonIndex = inner.indexOf(':');
					const remainder = inner.slice(colonIndex + 1);
					return remainder.trim().length > 0;
				}
			}
			return false;
		},
		preProcess(node, context) {
			const paragraph = node as Paragraph;
			const strong = paragraph.children[0] as import('mdast').Strong;
			const inner = stripStrong(strong, context);
			const colonIndex = inner.indexOf(':');
			const field: FieldInline = {
				construct: 'FieldInline',
				name: inner.slice(0, colonIndex).trim(),
				value: inner.slice(colonIndex + 1).trim(),
				position: cleanPosition(paragraph.position),
			};
			return field as unknown as Construct;
		},
	};
}
