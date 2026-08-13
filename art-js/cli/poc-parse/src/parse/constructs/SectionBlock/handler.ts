import { createNestedContext } from '../../framework/createNestedContext';
import type { MdastNode, VisitContext } from '../../framework/createNestedContext';
import { findTagable } from '../../framework/findTagable';
import { sectionDepth } from '../../framework/sectionDepth';
import type { Construct, SectionBlock } from '../../types';

export interface ConstructHandler {
	canHandle(record: Construct): boolean;
	handle(record: Construct, node: MdastNode, context: VisitContext): VisitContext;
}

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

			const heading = node as unknown as { depth: number };
			while (ctx.capturing() === 'SectionBlock') {
				const parentSection = findTagable(ctx);
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

			ctx.push(record as SectionBlock);
			const newCtx = createNestedContext('SectionBlock', ctx, undefined, section.children, section);
			newCtx.lastEnd = ctx.lastEnd;
			return newCtx;
		},
	};
}
