import { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../../records/findRecordFiles';
import { RepositoryCheckoutRecord, RepositoryRecord } from '../types';

import { readCheckoutRecord } from './readCheckoutRecord';

export async function loadCheckoutRecords(
	config: WorkspaceConfig,
	repos: RepositoryRecord[],
): Promise<RepositoryCheckoutRecord[]> {
	const searchPath = config.root.path;
	const recordFiles = await findRecordFiles(
		searchPath,
		config.records.pattern,
		['Checkout'],
		config.records,
	);
	const checkouts = await Promise.all(
		recordFiles.map(async file => {
			const record = await readCheckoutRecord(file);
			if (!record) {
				return null;
			}
			if (!record.name) {
				console.warn('checkout record with empty name, skipped');
				return null;
			}
			const repo = repos.find(r => r.name === record.repository);
			if (repo) {
				return {
					repo,
					checkout: record,
					filename: file.filename,
				};
			}
			return {
				checkout: record,
				filename: file.filename,
			};
		}),
	);
	return checkouts.filter((checkout): checkout is RepositoryCheckoutRecord => checkout !== null);
}
