import type { Position } from '@art-js/artificial-primitives';
import type { Position as UnistPosition } from 'unist';

export function cleanPosition(raw: UnistPosition | undefined): Position | undefined {
	if (!raw?.start || !raw.end) return undefined;
	return {
		start: { line: raw.start.line, column: raw.start.column, offset: raw.start.offset ?? 0 },
		end: { line: raw.end.line, column: raw.end.column, offset: raw.end.offset ?? 0 },
	};
}
