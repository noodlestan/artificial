import { type VisitContext, getSectionMap } from '@art-js/artificial-primitives';

export function findTagable(context: VisitContext): unknown | undefined {
	const sectionMap = getSectionMap();
	let current: VisitContext | undefined = context;
	while (current) {
		const section = sectionMap.get(current);
		if (section) return section;
		current = current.parent();
	}
	return undefined;
}
