import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { RepositoryRecord } from '../../private/records/types';
import { createCheckout } from '../../private/store/create-checkout';

import { cloneIfMissing } from './private/cloneIfMissing';

export async function cloneAll(ctx: WorkspaceContext, repos: RepositoryRecord[]): Promise<void> {
	for (const repo of repos) {
		if (!ctx.store.getCheckoutOfRepo(repo.name)) {
			const checkout = createCheckout(ctx.config, repo.name, repo);
			ctx.store.addCheckout(checkout);
		}
	}

	for (const checkout of ctx.store.getAllCheckouts()) {
		await cloneIfMissing(ctx, checkout);
	}
}
