import { loadCheckouts } from '../../config/load-checkouts';
import type { WorkspaceContext } from '../../shared/workspace-context';

import { cloneIfMissing } from './private/clone-if-missing';
import { defaultLocation } from './private/default-location';

export async function cloneAll(ctx: WorkspaceContext): Promise<void> {
	const { loadRepositories } = await import('../../config/load-repositories');
	const repos = loadRepositories(ctx.config, ctx.root);

	ctx.store.loadExistingCheckouts();
	const existingRecords = loadCheckouts(ctx.config, ctx.root);

	for (const repo of repos) {
		if (!ctx.store.findCheckout(repo.name)) {
			const override = existingRecords.find(r => r.repo.name === repo.name);
			const location = override?.location ?? defaultLocation(repo);
			ctx.store.addCheckout(repo, location);
		}
	}

	for (const checkout of ctx.store.getAllCheckouts()) {
		await cloneIfMissing(ctx, checkout);
	}
}
