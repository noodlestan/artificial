import { globSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function findCandidateFiles(searchPath: string, pattern: string): string[] {
	const normalizedPattern = pattern.includes('**') ? pattern : `**/${pattern}`;
	const globPattern = join(searchPath, normalizedPattern);

	try {
		const entries = globSync(globPattern, { withFileTypes: true });
		return entries
			.filter(entry => !entry.isDirectory())
			.map(entry => resolve(entry.parentPath, entry.name));
	} catch {
		return [];
	}
}
