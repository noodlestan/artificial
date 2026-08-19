import type { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../shared/findRecordFiles';
import type { NamespaceRecord } from '../types';

import { readNamespaceRecord } from './readNamespaceRecord';

export async function loadNamespaceRecords(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<NamespaceRecord[]> {
	const candidates = findRecordFiles(checkoutPath, config.records.pattern);
	const records: NamespaceRecord[] = [];
	for (const filePath of candidates) {
		const record = readNamespaceRecord(filePath);
		if (record) {
			records.push(record);
		}
	}
	return records;
}
