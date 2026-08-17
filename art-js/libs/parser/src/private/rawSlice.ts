import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';

export function rawSlice(node: MdastNode, context: VisitContext): string {
	if (!node.position?.start || !node.position?.end) return '';
	return context.source.slice(node.position.start.offset, node.position.end.offset);
}
