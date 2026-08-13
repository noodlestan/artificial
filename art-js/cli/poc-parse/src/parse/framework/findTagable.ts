import type { SectionBlock } from '../types';

import type { VisitContext } from './createNestedContext';
import { getSectionMap } from './createNestedContext';

export function findTagable(context: VisitContext): SectionBlock | undefined {
	const sectionMap = getSectionMap();
	let current: VisitContext | undefined = context;
	while (current) {
		const section = sectionMap.get(current);
		if (section) return section;
		current = current.parent();
	}
	return undefined;
}
