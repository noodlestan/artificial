import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';
import type { Node } from 'mdast';
import { phrasing } from 'mdast-util-phrasing';

import { cleanPosition } from '../../../helpers/cleanPosition';
import { rawSlice } from '../../../helpers/rawSlice';
import { createNaturalExpression } from '../../NaturalExpression/private/createNaturalExpression';

import type { NaturalBlock } from './types';

export function createNaturalBlock(node: Node, context: VisitContext): NaturalBlock {
	const block: NaturalBlock = {
		construct: 'NaturalBlock',
		...node,
		value: rawSlice(node, context),
		position: cleanPosition(node.position),
	};
	if (Array.isArray((node as MdastNode).children)) {
		const children = (node as MdastNode).children ?? [];
		const phrasingContainer =
			node.type === 'paragraph' || node.type === 'heading' || node.type === 'tableCell';
		block.children = children.map(child =>
			phrasingContainer || phrasing(child)
				? createNaturalExpression(child, context)
				: createNaturalBlock(child as Node, context),
		) as NaturalBlock['children'];
	}
	return block;
}
