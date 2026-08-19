import type { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../shared/findRecordFiles';
import type { ProjectRecord } from '../types';

import { readProjectRecord } from './readProjectRecord';

export async function loadProjectRecords(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<ProjectRecord[]> {
	const candidates = findRecordFiles(checkoutPath, config.records.pattern);
	const records: ProjectRecord[] = [];
	for (const filePath of candidates) {
		const record = readProjectRecord(filePath);
		if (record) {
			records.push(record);
		}
	}
	return records;
}
