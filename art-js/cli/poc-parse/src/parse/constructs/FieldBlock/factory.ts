import type { Paragraph, Strong } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import type { MdastNode, VisitContext } from '../../framework/createNestedContext';
import type { ConstructFactory } from '../../framework/getFactory';
import { rawSlice } from '../../framework/rawSlice';
import type { FieldBlock } from '../../types';
import { createNaturalBlock } from '../NaturalBlock/factory';

const FIELD_TEXT_PATTERN = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;

function stripStrong(node: Strong, context: VisitContext): string {
	const raw = rawSlice(node, context);
	if (raw.length >= 4 && raw.startsWith('**') && raw.endsWith('**')) return raw.slice(2, -2);
	if (raw.length >= 4 && raw.startsWith('__') && raw.endsWith('__')) return raw.slice(2, -2);
	return raw;
}

function isFieldStrong(node: import('mdast').Nodes, context: VisitContext): node is Strong {
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
}

export function createFieldBlockFromParagraph(
	paragraph: Paragraph,
	context: VisitContext,
): FieldBlock {
	const strong = paragraph.children[0] as Strong;
	const inner = stripStrong(strong, context);
	const colonIndex = inner.indexOf(':');
	const name = inner.slice(0, colonIndex).trim();

	const field: FieldBlock = {
		construct: 'FieldBlock',
		name,
		value: [],
		position: cleanPosition(paragraph.position),
	};

	const remainder = inner.slice(colonIndex + 1);
	if (remainder) {
		field.value.push({
			construct: 'NaturalBlock',
			type: 'text',
			value: remainder.trim(),
			position: cleanPosition(strong.position),
		});
	}

	for (const child of paragraph.children.slice(1)) {
		field.value.push(createNaturalBlock(child as MdastNode, context));
	}

	return field;
}

export const fieldBlockFactory: ConstructFactory = {
	detect(node, context) {
		if (node.type === 'paragraph') {
			const first = (node as Paragraph).children[0];
			return first !== undefined && isFieldStrong(first, context);
		}
		return false;
	},
	create(node, context) {
		return createFieldBlockFromParagraph(node as Paragraph, context);
	},
	shouldVisit: false,
};

export { isFieldStrong };
