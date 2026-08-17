import type { Position } from '@art-js/artificial-primitives';
import type { Position as UnistPosition } from 'unist';

import type { MdastNode, VisitContext } from './types';

export function cleanPosition(raw: UnistPosition | undefined): Position | undefined {
	if (!raw?.start || !raw.end) return undefined;
	return {
		start: { line: raw.start.line, column: raw.start.column, offset: raw.start.offset ?? 0 },
		end: { line: raw.end.line, column: raw.end.column, offset: raw.end.offset ?? 0 },
	};
}

export function rawSlice(node: MdastNode, context: VisitContext): string {
	const start = node.position?.start?.offset;
	const end = node.position?.end?.offset;
	return start === undefined || end === undefined ? '' : context.source.slice(start, end);
}
