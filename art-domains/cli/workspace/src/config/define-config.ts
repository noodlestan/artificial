import type { RepositoryCheckout, WorkspaceConfig } from './types';

export function defineConfig(config: WorkspaceConfig): WorkspaceConfig {
	return config;
}

export function locateCheckouts(config: WorkspaceConfig): RepositoryCheckout[] {
	const checkouts: RepositoryCheckout[] = [];

	for (const entry of config.checkouts) {
		const repo = config.records.repos.find(r => r.name === entry.repo);
		if (repo) {
			checkouts.push({
				repo,
				location: entry.location,
				branch: entry.branch,
			});
		} else {
			console.warn(`checkout ${entry.repo}: no such repository record, skipped`);
		}
	}

	return checkouts;
}
