import type { WorkspaceConfig } from '../../config';

import { createRecordFile } from './private/createRecordFile';
import { directoryExists } from './private/directoryExists';
import { filterBuiltInExcludes } from './private/filterBuiltInExcludes';
import { filterFilenamesByKinds } from './private/filterByKinds';
import { filterByPatterns } from './private/filterByPatterns';
import { findCandidateFiles } from './private/findCandidateFiles';
import { getIgnoredSet } from './private/getIgnoredSet';
import type { RecordFile } from './types';

export async function findRecordFiles(
	searchPath: string,
	pattern: string,
	kinds: string | string[] = [],
	recordsConfig: WorkspaceConfig['records'] = {
		pattern: '*.art',
		dotignored: ['gitignore'],
		ignored: [],
		included: [],
	},
): Promise<RecordFile[]> {
	if (!directoryExists(searchPath)) {
		return [];
	}

	const candidates = filterBuiltInExcludes(searchPath, findCandidateFiles(searchPath, pattern));
	const ignored = getIgnoredSet(recordsConfig, searchPath, candidates);
	const filtered = filterByPatterns(
		searchPath,
		candidates,
		ignored,
		recordsConfig.ignored,
		recordsConfig.included,
	);
	const kindFilter = Array.isArray(kinds) ? kinds : [kinds];

	const files = filtered.sort().map(filename => createRecordFile(searchPath, filename));
	return filterFilenamesByKinds(files, kindFilter);
}
