import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { WorkspaceConfig } from '../../config';

import { readCheckoutRecord } from './readCheckoutRecord';
import { RepositoryCheckoutRecord, RepositoryRecord } from './types';
export function loadCheckoutRecords(
	config: WorkspaceConfig,
	repos: RepositoryRecord[],
): RepositoryCheckoutRecord[] {
	const dir = join(config.root.path, config.records.checkouts.path);
	if (!existsSync(dir)) {
		return [];
	}
	const files = readdirSync(dir).filter(f => f.endsWith('.art'));
	const checkouts: RepositoryCheckoutRecord[] = [];
	for (const file of files) {
		const record = readCheckoutRecord(join(dir, file));
		if (!record.name) {
			console.warn('checkout record with empty name, skipped');
			continue;
		}
		const repo = repos.find(r => r.name === record.repository);
		if (repo) {
			checkouts.push({
				repo,
				checkout: record,
			});
		} else {
			checkouts.push({
				checkout: record,
			});
		}
	}
	return checkouts;
}
