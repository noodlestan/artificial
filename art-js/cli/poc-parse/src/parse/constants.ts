export const BLOCK_TYPES = new Set([
	'paragraph',
	'code',
	'list',
	'blockquote',
	'table',
	'thematicBreak',
	'html',
	'definition',
]);

export function isBlockType(type: string): boolean {
	return BLOCK_TYPES.has(type);
}
