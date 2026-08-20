import { relative, resolve } from 'node:path';

import type { RecordFile } from '../types';

export function createRecordFile(searchPath: string, filename: string): RecordFile {
	const resolvedSearchPath = resolve(searchPath);
	const resolvedFilename = resolve(filename);

	return {
		filename: resolvedFilename,
		searchPath,
		path: relative(resolvedSearchPath, resolvedFilename),
	};
}
