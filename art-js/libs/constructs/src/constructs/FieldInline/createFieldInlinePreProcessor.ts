import type { Paragraph } from 'mdast';

import { cleanPosition } from '../../helpers/cleanPosition';
import { rawSlice } from '../../helpers/rawSlice';
import type { Construct } from '../../registry';
import { isFieldStrong } from '../FieldBlock/private/isFieldStrong';
import { stripStrong } from '../FieldBlock/private/stripStrong';
import { createNaturalExpression } from '../NaturalExpression/private/createNaturalExpression';
import type { ConstructPreProcessor } from '../types';

import type { FieldInline } from './private/types';

function trimFieldEdges(value: ReturnType<typeof createNaturalExpression>[]): typeof value {
	const trimmed = [...value];
	const first = trimmed[0];
	const last = trimmed[trimmed.length - 1];

	if (first?.type === 'text' && typeof first?.value === 'string')
		first.value = first.value.replace(/^\s+/, '');
	if (last?.type === 'text' && typeof last?.value === 'string')
		last.value = last.value.replace(/\s+$/, '');

	return trimmed.filter(
		expression =>
			expression.type !== 'text' ||
			(typeof expression.value === 'string' && expression.value.length > 0),
	);
}

export function createFieldInlinePreProcessor(): ConstructPreProcessor {
	return {
		preProcess(node, context) {
			if (node.type !== 'paragraph') return null;
			const paragraph = node as Paragraph;
			const first = paragraph.children[0];
			if (first === undefined || !isFieldStrong(first, context)) return null;
			const strong = first as import('mdast').Strong;
			const paragraphRaw = rawSlice(paragraph, context);
			const strongRaw = rawSlice(strong, context);
			if (paragraphRaw.slice(strongRaw.length).trim().length === 0) return null;
			const inner = stripStrong(strong, context);
			const colonIndex = inner.indexOf(':');
			const value = trimFieldEdges(
				paragraph.children.slice(1).map(child => createNaturalExpression(child, context)),
			);
			const field: FieldInline = {
				construct: 'FieldInline',
				name: inner.slice(0, colonIndex).trim(),
				value,
				position: cleanPosition(paragraph.position),
			};
			return field as unknown as Construct;
		},
	};
}
