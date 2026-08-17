import type { ConstructFactory, MdastNode, VisitContext } from './types';

export type { ConstructFactory };

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
