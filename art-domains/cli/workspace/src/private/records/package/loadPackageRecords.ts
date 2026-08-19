import type { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../shared/findRecordFiles';
import type { PackageRecord } from '../types';

import { readPackageRecord } from './readPackageRecord';

export async function loadPackageRecords(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<PackageRecord[]> {
	const candidates = findRecordFiles(checkoutPath, config.records.pattern);
	const records: PackageRecord[] = [];
	for (const filePath of candidates) {
		const record = readPackageRecord(filePath);
		if (record) {
			records.push(record);
		}
	}
	return records;
}
