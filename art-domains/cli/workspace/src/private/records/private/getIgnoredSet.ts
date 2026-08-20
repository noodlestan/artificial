import type { WorkspaceConfig } from '../../../config';

import { getGitIgnoredSet } from './getGitIgnoredSet';

export function getIgnoredSet(
	config: Pick<WorkspaceConfig['records'], 'dotignored'>,
	searchPath: string,
	candidates: string[],
): Set<string> {
	if (config.dotignored.includes('gitignore')) {
		return getGitIgnoredSet(searchPath, candidates);
	}

	return new Set();
}
