import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { RepositoryRecord } from '../../private/resources/types';
import { createCheckout } from '../../private/store/createCheckout';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

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

	await scanAllCheckoutsStates(ctx.store);
	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
