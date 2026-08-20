import { createNestedContext, sectionDepth } from '@art-js/artificial-primitives';
import type { Heading } from 'mdast';

import { findTagable } from '../../Tag/private/findTagable';
import type { ConstructHandler } from '../../types';

import type { SectionBlock } from './types';

export function createSectionBlockHandler(): ConstructHandler {
	return {
		handle(record, node, context) {
			const section = record as SectionBlock;
			let ctx = context;

			const heading = node as Heading;
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
