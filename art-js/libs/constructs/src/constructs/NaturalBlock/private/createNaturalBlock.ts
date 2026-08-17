import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';
import type { List } from 'mdast';

import { cleanPosition } from '../../../helpers/cleanPosition';
import { rawSlice } from '../../../helpers/rawSlice';

import type { NaturalBlock } from './types';

export function createNaturalBlock(node: MdastNode, context: VisitContext): NaturalBlock {
	const block: NaturalBlock = {
		construct: 'NaturalBlock',
		...node,
		value: rawSlice(node, context),
		position: cleanPosition(node.position),
	};
	if (node.type === 'code') {
		block.lang = node.lang ?? null;
		block.meta = node.meta ?? null;
	} else if (node.type === 'list') {
		block.children = [];
		for (const item of (node as List).children) {
			const content = item.children.find(child => child.type === 'paragraph');
			if (content)
				block.children.push({
					construct: 'NaturalBlock',
					value: rawSlice(content, context).trim(),
					position: cleanPosition(content.position),
				});
		}
	} else if (node.type === 'blockquote') {
		block.children = node.children.map((child: MdastNode) => createNaturalBlock(child, context));
	}
	return block;
}
