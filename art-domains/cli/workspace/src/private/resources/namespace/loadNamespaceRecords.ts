import type { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../../records/findRecordFiles';
import type { NamespaceRecord } from '../types';

import { readNamespaceRecord } from './readNamespaceRecord';

export async function loadNamespaceRecords(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<NamespaceRecord[]> {
	const recordFiles = await findRecordFiles(
		checkoutPath,
		config.records.pattern,
		['Namespace'],
		config.records,
	);
	const records = await Promise.all(recordFiles.map(file => readNamespaceRecord(file)));
	return records.filter((record): record is NamespaceRecord => record !== null);
}
