import type {
	BlockContent,
	DefinitionContent,
	ListContent,
	Node,
	PhrasingContent,
	RootContent,
	RowContent,
	TableContent,
} from 'mdast';

import type { ConstructBase } from '../constructs.js';
import type { Point } from '../point.js';

type ChildNode =
	| RootContent
	| BlockContent
	| PhrasingContent
	| ListContent
	| DefinitionContent
	| TableContent
	| RowContent;

export type MdastNode = Node & {
	children?: ChildNode[];
	value?: string;
};

export type BeforeRecord = (record: ConstructBase, context: VisitContext) => VisitContext;

export interface VisitContext {
	capturing(): string | undefined;
	target(): ConstructBase[];
	push(record: ConstructBase): void;
	beforeRecord(record: ConstructBase): VisitContext;
	parent(): VisitContext | undefined;
	source: string;
	lastEnd: Point | undefined;
}
