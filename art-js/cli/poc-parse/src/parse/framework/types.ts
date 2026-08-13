import type { Node } from 'unist';

import type { BlockContent, Construct, Point } from '../types';

export type MdastNode = Node;

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
	create(node: MdastNode, context: VisitContext): Construct;
	shouldVisit: boolean;
}
