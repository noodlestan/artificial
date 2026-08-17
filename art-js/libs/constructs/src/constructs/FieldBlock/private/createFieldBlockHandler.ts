import { createNestedContext } from '@art-js/artificial-primitives';

import type { ConstructHandler } from '../../types';

import type { FieldBlock } from './types';

export function createFieldBlockHandler(): ConstructHandler {
	return {
		canHandle(record) {
			return record.construct === 'FieldBlock';
		},
		handle(record, _node, context) {
			const field = record as FieldBlock;
			let ctx = context;

			if (ctx.capturing() === 'FieldBlock') {
				const p = ctx.parent();
				if (p) {
					p.lastEnd = ctx.lastEnd;
					ctx = p;
				}
			}

			ctx.push(field);
			const newCtx = createNestedContext('FieldBlock', ctx, undefined, field.value);
			newCtx.lastEnd = ctx.lastEnd;
			return newCtx;
		},
	};
}
