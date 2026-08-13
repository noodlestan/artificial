import type { NaturalBlock, Point } from '../types';

import type { VisitContext } from './types';

export function flushGap(
	start: Point,
	lastEnd: Point | undefined,
	source: string,
	context: VisitContext,
): void {
	if (lastEnd && start.offset > lastEnd.offset) {
		const gap = source.slice(lastEnd.offset, start.offset);
		if (gap) {
			const gapBlock: NaturalBlock = {
				construct: 'NaturalBlock',
				type: 'text',
				value: gap,
			};
			context.push(gapBlock);
		}
	}
}
