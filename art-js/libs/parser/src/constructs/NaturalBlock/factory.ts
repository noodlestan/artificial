import type { List } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import { rawSlice } from '../../framework/rawSlice';
import type { ConstructFactory, MdastNode, VisitContext } from '../../framework/types';
import type { NaturalBlock } from '../../types';
export function createNaturalBlock(node: MdastNode, context: VisitContext): NaturalBlock {
	const block: NaturalBlock = {
		construct: 'NaturalBlock',
		...(node as unknown as Record<string, unknown>),
		value: rawSlice(node, context),
		position: cleanPosition(node.position),
	};

	if (node.type === 'code') {
		const code = node as unknown as { lang?: string | null; meta?: string | null };
		block.lang = code.lang ?? null;
		block.meta = code.meta ?? null;
	} else if (node.type === 'list') {
		const list = node as List;
		block.children = [];
		for (const item of list.children) {
			const content = item.children.find(child => child.type === 'paragraph');
			if (content) {
				block.children.push({
					construct: 'NaturalBlock',
					value: rawSlice(content, context).trim(),
					position: cleanPosition(content.position),
				});
			}
		}
	} else if (node.type === 'blockquote') {
		const bq = node as unknown as { children: MdastNode[] };
		block.children = bq.children.map(child => createNaturalBlock(child, context));
	}

	return block;
}

export const naturalBlockFactory: ConstructFactory = {
	detect() {
		return true;
	},
	create(node, context) {
		return createNaturalBlock(node, context);
	},
	shouldVisit: false,
};
