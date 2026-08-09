import type { RepositoryCheckout, WorkspaceConfig } from './types';

/**
 * Type-check and normalise a `WorkspaceConfig` at authoring time; the single
 * public entry point for writing a manifest.
 */
export function defineConfig(config: WorkspaceConfig): WorkspaceConfig {
	return config;
}

/**
 * Derive the checkouts list from the records' `checkout` fields at entry point.
 * Pure derivation — no filesystem or git probing, no I/O. Returns a list, so
 * multiple checkouts of the same repo are representable.
 */
export function locateCheckouts(config: WorkspaceConfig): RepositoryCheckout[] {
	const checkouts: RepositoryCheckout[] = [];

	for (const repo of config.records.repos) {
		if (repo.checkout) {
			checkouts.push({
				repo,
				location: repo.checkout,
				branch: repo.branch ?? 'main',
			});
		} else {
			console.warn(`repo ${repo.name}: no checkout, skipped`);
		}
	}

	return checkouts;
}
