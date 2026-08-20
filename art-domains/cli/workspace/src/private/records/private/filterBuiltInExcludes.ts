import { relative } from 'node:path';

const BUILT_IN_EXCLUDED_DIRECTORIES = new Set(['.git']);

export function filterBuiltInExcludes(searchPath: string, candidates: string[]): string[] {
	return candidates.filter(filePath => {
		const pathSegments = relative(searchPath, filePath).split('/');
		return !pathSegments.some(segment => BUILT_IN_EXCLUDED_DIRECTORIES.has(segment));
	});
}
