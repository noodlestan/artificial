/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BlockContent, Construct, Point } from '../types';

// Mdast types often carry complex generic 'data' shapes that diverge between
// mdast versions. Use a permissive any here to avoid fragile cross-package type
// incompatibilities during migration.
export type MdastNode = any;

export interface VisitContext {
	capturing(): string | undefined;
	target(): BlockContent[];
	push(record: BlockContent): void;
	parent(): VisitContext | undefined;
	source: string;
	lastEnd: Point | undefined;
}

export interface ConstructFactory {
	detect(node: MdastNode, context: VisitContext): boolean;
	create(node: MdastNode, context: VisitContext): Construct | Construct[];
	shouldVisit: boolean;
}
