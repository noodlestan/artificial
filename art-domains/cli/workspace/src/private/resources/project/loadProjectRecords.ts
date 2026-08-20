import type { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../../records/findRecordFiles';
import type { ProjectRecord } from '../types';

import { readProjectRecord } from './readProjectRecord';

export async function loadProjectRecords(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<ProjectRecord[]> {
	const recordFiles = await findRecordFiles(
		checkoutPath,
		config.records.pattern,
		['Project'],
		config.records,
	);

	const records = await Promise.all(recordFiles.map(file => readProjectRecord(file)));
	return records.filter((record): record is ProjectRecord => record !== null);
}
