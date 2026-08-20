import type { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../../records/findRecordFiles';
import type { PackageRecord } from '../types';

import { readPackageRecord } from './readPackageRecord';

export async function loadPackageRecords(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<PackageRecord[]> {
	const recordFiles = await findRecordFiles(
		checkoutPath,
		config.records.pattern,
		['Package'],
		config.records,
	);
	const records = await Promise.all(recordFiles.map(file => readPackageRecord(file)));
	return records.filter((record): record is PackageRecord => record !== null);
}
