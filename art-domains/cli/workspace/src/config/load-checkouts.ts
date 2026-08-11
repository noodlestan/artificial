import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { readCheckoutRecord } from '../private/records/checkout-record';

import { loadRepositories } from './load-repositories';
import type { RepositoryCheckout, WorkspaceConfig } from './types';

export function loadCheckouts(config: WorkspaceConfig, root: string): RepositoryCheckout[] {
	const repos = loadRepositories(config, root);
	const dir = join(root, config.records.checkouts.path);
	if (!existsSync(dir)) {
		return [];
	}
	const files = readdirSync(dir).filter(f => f.endsWith('.art'));
	const checkouts: RepositoryCheckout[] = [];
	for (const file of files) {
		const record = readCheckoutRecord(join(dir, file));
		if (!record.name) {
			console.warn('checkout record with empty name, skipped');
			continue;
		}
		const repo = repos.find(r => r.name === record.name);
		if (repo) {
			checkouts.push({
				repo,
				location: record.location,
				branch: record.branch,
			});
		} else {
			console.warn(
				`checkout ${record.name}: no matching repository record, using synthetic repository`,
			);
			checkouts.push({
				repo: { name: record.name, remote: '' },
				location: record.location,
				branch: record.branch,
			});
		}
	}
	return checkouts;
}
