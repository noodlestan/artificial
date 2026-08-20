import type { Node } from 'mdast';

import type { ConstructToMdast } from '../types';

import type { NaturalExpression } from './private/types';

export function createNaturalExpressionToMdast(): ConstructToMdast {
	return {
		construct: 'NaturalExpression',
		toMdast(node, children) {
			const expression = node as unknown as NaturalExpression;
			const attributes = { ...expression.attributes };
			return { type: expression.type, value: expression.value, children, ...attributes } as Node;
		},
	};
}
