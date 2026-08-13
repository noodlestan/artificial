import type { Paragraph, Strong } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import type { ConstructFactory, MdastNode, VisitContext } from '../../framework/types';
import type { FieldBlock } from '../../types';
import { createNaturalBlock } from '../NaturalBlock/factory';

import { isFieldStrong, stripStrong } from './private/isFieldStrong';

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
