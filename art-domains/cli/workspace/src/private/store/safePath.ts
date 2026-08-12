export function safePath(pathStr: string): string {
	return pathStr
		.toLowerCase()
		.replace(/[^a-z-]/g, '-')
		.replace(/-+/g, '-');
}
