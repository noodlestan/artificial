import type { BlockContent } from '@art-js/artificial-constructs';
import type { Point, VisitContext } from '@art-js/artificial-primitives';

export function flushGap(
	start: Point,
	lastEnd: Point | undefined,
	source: string,
	context: VisitContext,
): void {
	if (lastEnd && start.offset > lastEnd.offset) {
		const gap = source.slice(lastEnd.offset, start.offset);
		if (gap) {
			// WIP replace by factory call
			const gapBlock = {
				construct: 'NaturalBlock' as const,
				type: 'text',
				value: gap,
			} as BlockContent;
			context.push(gapBlock);
		}
	}
}
