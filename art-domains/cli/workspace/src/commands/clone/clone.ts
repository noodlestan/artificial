import type { WorkspaceContext } from '../../private/context/workspace-context';
import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentOperationsReport } from '../../private/present/present-operations-report';
import { loadCheckoutRecords } from '../../private/records/load-checkout-records';
import { loadRepositoryRecords } from '../../private/records/load-repository-rercords';
import { hydrateStoreFromRecords } from '../../private/store/hydrate-store-from-records';

import { cloneAll } from './clone-all';
import { cloneSpecific } from './clone-specific';
import { cloneStatus } from './clone-status';

interface CloneOptions {
	all?: boolean;
	repoName?: string;
	checkoutInput?: string;
}

export async function runClone(
	ctx: WorkspaceContext,
	{ all, repoName, checkoutInput }: CloneOptions,
): Promise<WorkspaceContext> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx, records);

	if (all) {
		await cloneAll(ctx, repos);
	} else if (repoName) {
		await cloneSpecific(ctx, repoName, checkoutInput);
	} else {
		await cloneStatus(ctx);
	}

	presentCheckoutReport(ctx);
	presentOperationsReport(ctx.log);

	return ctx;
}
