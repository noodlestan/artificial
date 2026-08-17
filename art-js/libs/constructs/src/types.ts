import type { BlockContent, Construct, Point } from '@art-js/artificial-primitives';

// Mdast's generic node shapes vary across parser versions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
