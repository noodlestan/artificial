import type { ConstructBase, VisitContext } from '@art-js/artificial-primitives';
import { createNestedContext } from '@art-js/artificial-primitives';

import type { ConstructHandler } from '../../types';

import type { FieldBlock } from './types';

const FIELD_BLOCK_BOUNDARIES = new Set(['FieldBlock', 'FieldInline', 'SectionBlock']);

function closeFieldBlock(record: ConstructBase, context: VisitContext): VisitContext {
	if (!FIELD_BLOCK_BOUNDARIES.has(record.construct)) return context;

	const parent = context.parent();
	if (!parent) return context;

	parent.lastEnd = context.lastEnd;
	return parent;
}

export function createFieldBlockHandler(): ConstructHandler {
	return {
		handle(record, _node, context) {
			const field = record as FieldBlock;
			context.push(field);
			const newCtx = createNestedContext(
				'FieldBlock',
				context,
				undefined,
				field.value,
				undefined,
				closeFieldBlock,
			);
			newCtx.lastEnd = context.lastEnd;
			return newCtx;
		},
	};
}
