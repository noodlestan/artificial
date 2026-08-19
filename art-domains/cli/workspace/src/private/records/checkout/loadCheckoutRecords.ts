import { WorkspaceConfig } from '../../../config';
import { findRecordFiles } from '../shared/findRecordFiles';
import { RepositoryCheckoutRecord, RepositoryRecord } from '../types';

import { readCheckoutRecord } from './readCheckoutRecord';

export async function loadCheckoutRecords(
	config: WorkspaceConfig,
	repos: RepositoryRecord[],
): Promise<RepositoryCheckoutRecord[]> {
	const searchPath = config.root.path;
	const candidates = findRecordFiles(searchPath, config.records.pattern);
	const checkouts: RepositoryCheckoutRecord[] = [];
	for (const filePath of candidates) {
		const record = readCheckoutRecord(filePath);
		if (!record) {
			continue;
		}
		if (!record.name) {
			console.warn('checkout record with empty name, skipped');
			continue;
		}
		const repo = repos.find(r => r.name === record.repository);
		if (repo) {
			checkouts.push({
				repo,
				checkout: record,
				filename: filePath,
			});
		} else {
			checkouts.push({
				checkout: record,
				filename: filePath,
			});
		}
	}
	return checkouts;
}
