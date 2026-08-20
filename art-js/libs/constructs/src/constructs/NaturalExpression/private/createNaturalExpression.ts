import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';

import { cleanPosition } from '../../../helpers/cleanPosition';

import type { NaturalExpression } from './types';

export function createNaturalExpression(
	node: MdastNode,
	_context: VisitContext,
): NaturalExpression {
	const { children: mdastChildren, position, type, value, ...attributes } = node;

	const expression: NaturalExpression = {
		construct: 'NaturalExpression',
		type,
		attributes,
		value,
		position: cleanPosition(position),
	};

	if (Array.isArray(mdastChildren)) {
		expression.children = mdastChildren.map((child: MdastNode) =>
			createNaturalExpression(child, _context),
		);
	}

	return expression;
}
