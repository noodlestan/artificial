import { readFile } from 'node:fs/promises';

import type { RecordFile } from './types';

export async function readRecordFileContent(file: RecordFile): Promise<RecordFile> {
	if (file.content !== undefined || file.error) {
		return file;
	}

	try {
		return {
			...file,
			content: await readFile(file.filename, 'utf-8'),
		};
	} catch (error: unknown) {
		return {
			...file,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}
