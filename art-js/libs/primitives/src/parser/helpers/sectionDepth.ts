export function sectionDepth(section: { depth?: number }): number {
	return section.depth ?? 1;
}
