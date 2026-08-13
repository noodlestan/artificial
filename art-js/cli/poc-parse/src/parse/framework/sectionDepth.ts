import type { SectionBlock } from '../types';

export function sectionDepth(section: SectionBlock): number {
	return section.depth ?? 1;
}
