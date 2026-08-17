import { createNestedContext, sectionDepth } from '@art-js/artificial-primitives';

import { findTagable } from '../../Tag/private/findTagable';
import type { ConstructHandler } from '../../types';

import type { SectionBlock } from './types';

export function createSectionBlockHandler(): ConstructHandler {
	return {
		canHandle(record) {
			return record.construct === 'SectionBlock';
		},
		handle(record, node, context) {
			const section = record as SectionBlock;
			let ctx = context;

			if (ctx.capturing() === 'FieldBlock') {
				const p = ctx.parent();
				if (p) {
					p.lastEnd = ctx.lastEnd;
					ctx = p;
				}
			}

			const heading = node as { depth: number };
			while (ctx.capturing() === 'SectionBlock') {
				const parentSection = findTagable(ctx) as SectionBlock;
				if (parentSection && sectionDepth(parentSection) >= heading.depth) {
					const p = ctx.parent();
					if (p) {
						p.lastEnd = ctx.lastEnd;
						ctx = p;
					}
				} else {
					break;
				}
			}

			ctx.push(section);
			const newCtx = createNestedContext('SectionBlock', ctx, undefined, section.children, section);
			newCtx.lastEnd = ctx.lastEnd;
			return newCtx;
		},
	};
}
