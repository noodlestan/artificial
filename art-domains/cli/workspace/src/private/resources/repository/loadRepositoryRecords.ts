import { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../../records/findRecordFiles';
import { RepositoryRecord } from '../types';

import { readRepositoryRecord } from './readRepositoryRecord';

export async function loadRepositoryRecords(config: WorkspaceConfig): Promise<RepositoryRecord[]> {
	const searchPath = config.root.path;
	const recordFiles = await findRecordFiles(
		searchPath,
		config.records.pattern,
		['Repository'],
		config.records,
	);
	const records = await Promise.all(recordFiles.map(file => readRepositoryRecord(file)));
	return records.filter((record): record is RepositoryRecord => record !== null);
}
