import type { Construct } from '../types';

import type { MdastNode, VisitContext } from './createNestedContext';

export interface ConstructFactory {
	detect(node: MdastNode, context: VisitContext): boolean;
	create(node: MdastNode, context: VisitContext): Construct;
	shouldVisit: boolean;
}

export function getFactory(
	node: MdastNode,
	context: VisitContext,
	factories: ConstructFactory[],
): ConstructFactory | null {
	for (const factory of factories) {
		if (factory.detect(node, context)) return factory;
	}
	return null;
}
