import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';

import { cloneAll } from './cloneAll';
import { cloneSpecific } from './cloneSpecific';
import { cloneStatus } from './cloneStatus';

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
		await cloneSpecific(ctx, repos, repoName, checkoutInput);
	} else {
		await cloneStatus(ctx);
	}

	return ctx;
}
