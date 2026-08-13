import type { Node } from 'unist';

import type { BlockContent, Point, SectionBlock } from '../types';

export type MdastNode = Node;

export interface VisitContext {
	capturing(): string | undefined;
	target(): BlockContent[];
	push(record: BlockContent): void;
	parent(): VisitContext | undefined;
	source: string;
	lastEnd: Point | undefined;
}

const sectionMap = new WeakMap<VisitContext, SectionBlock>();

export function getSectionMap(): WeakMap<VisitContext, SectionBlock> {
	return sectionMap;
}

export function createNestedContext(
	structure: string,
	parentContext: VisitContext | undefined,
	source?: string,
	targetArray?: BlockContent[],
	section?: SectionBlock,
): VisitContext {
	const children = targetArray ?? [];

	const ctx: VisitContext = {
		capturing() {
			return structure;
		},
		target() {
			return children;
		},
		push(record: BlockContent) {
			children.push(record);
		},
		parent() {
			return parentContext;
		},
		source: source ?? parentContext?.source ?? '',
		lastEnd: parentContext?.lastEnd,
	};

	if (section) {
		sectionMap.set(ctx, section);
	}

	return ctx;
}
