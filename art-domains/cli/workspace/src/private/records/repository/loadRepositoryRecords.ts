import { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../shared/findRecordFiles';
import { RepositoryRecord } from '../types';

import { readRepositoryRecord } from './readRepositoryRecord';

export async function loadRepositoryRecords(config: WorkspaceConfig): Promise<RepositoryRecord[]> {
	const searchPath = config.root.path;
	const candidates = findRecordFiles(searchPath, config.records.pattern);
	const records: RepositoryRecord[] = [];
	for (const filePath of candidates) {
		const record = readRepositoryRecord(filePath);
		if (record) {
			records.push(record);
		}
	}
	return records;
}
