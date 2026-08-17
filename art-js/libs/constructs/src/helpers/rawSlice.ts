import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';

export function rawSlice(node: MdastNode, context: VisitContext): string {
	const start = node.position?.start?.offset;
	const end = node.position?.end?.offset;
	return start === undefined || end === undefined ? '' : context.source.slice(start, end);
}
