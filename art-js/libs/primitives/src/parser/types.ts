/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ConstructBase } from '../constructs.js';
import type { Point } from '../point.js';

export type MdastNode = any;

export interface VisitContext {
	capturing(): string | undefined;
	target(): ConstructBase[];
	push(record: ConstructBase): void;
	parent(): VisitContext | undefined;
	source: string;
	lastEnd: Point | undefined;
}
