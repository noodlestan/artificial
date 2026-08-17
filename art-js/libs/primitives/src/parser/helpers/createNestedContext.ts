import type { ConstructBase } from '../../constructs.js';
import type { VisitContext } from '../types.js';

const sectionMap = new WeakMap<VisitContext, unknown>();

export function getSectionMap(): WeakMap<VisitContext, unknown> {
	return sectionMap;
}

export function createNestedContext(
	structure: string,
	parentContext: VisitContext | undefined,
	source?: string,
	targetArray?: ConstructBase[],
	section?: unknown,
): VisitContext {
	const children = targetArray ?? [];

	const ctx: VisitContext = {
		capturing() {
			return structure;
		},
		target() {
			return children;
		},
		push(record: ConstructBase) {
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
