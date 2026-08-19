import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { WorkspaceConfig } from '../../../config';
import { RepositoryCheckoutRecord, RepositoryRecord } from '../types';

import { readCheckoutRecord } from './readCheckoutRecord';
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
		const filePath = join(dir, file);
		const record = readCheckoutRecord(filePath);
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
