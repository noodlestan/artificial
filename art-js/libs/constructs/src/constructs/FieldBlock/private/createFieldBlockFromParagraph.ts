import type { VisitContext } from '@art-js/artificial-primitives';
import type { Paragraph, Strong } from 'mdast';

import { cleanPosition } from '../../../helpers/cleanPosition';
import { createNaturalBlock } from '../../NaturalBlock/private/createNaturalBlock';
import type { NaturalBlock } from '../../NaturalBlock/private/types';

import { stripStrong } from './stripStrong';
import type { FieldBlock } from './types';

export function createFieldBlockFromParagraph(
	paragraph: Paragraph,
	context: VisitContext,
): FieldBlock {
	const strong = paragraph.children[0] as Strong;
	const inner = stripStrong(strong, context);
	const colonIndex = inner.indexOf(':');
	const field: FieldBlock = {
		construct: 'FieldBlock',
		name: inner.slice(0, colonIndex).trim(),
		value: [],
		position: cleanPosition(paragraph.position),
	};
	const remainder = inner.slice(colonIndex + 1);
	if (remainder)
		field.value.push({
			construct: 'NaturalBlock',
			type: 'text',
			value: remainder.trim(),
			position: cleanPosition(strong.position),
		} as NaturalBlock);
	for (const child of paragraph.children.slice(1))
		field.value.push(createNaturalBlock(child, context));
	return field;
}
