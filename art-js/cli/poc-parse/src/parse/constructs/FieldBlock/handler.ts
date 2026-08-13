import { createNestedContext } from '../../framework/createNestedContext';
import type { FieldBlock } from '../../types';
import type { ConstructHandler } from '../SectionBlock/handler';

export function createFieldBlockHandler(): ConstructHandler {
	return {
		canHandle(record) {
			return record.construct === 'FieldBlock';
		},
		handle(record, node, context) {
			const field = record as FieldBlock;
			let ctx = context;

			if (ctx.capturing() === 'FieldBlock') {
				const p = ctx.parent();
				if (p) {
					p.lastEnd = ctx.lastEnd;
					ctx = p;
				}
			}

			ctx.push(record as FieldBlock);
			const newCtx = createNestedContext('FieldBlock', ctx, undefined, field.value);
			newCtx.lastEnd = ctx.lastEnd;
			return newCtx;
		},
	};
}
