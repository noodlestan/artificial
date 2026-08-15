import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentExtraneousReport } from '../../private/present/presentExtraneousReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { presentWorkspaceReport } from '../../private/present/presentWorkspaceReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { scanAllCheckoutsStates } from '../../private/scan/scanAllCheckoutsStates';
import { scanExtraneousCheckouts } from '../../private/scan/scanExtraneousCheckouts';
import { scanWorkspaceState } from '../../private/scan/scanWorkspaceState';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';

import { pullWorkspaceCheckout } from './private/pullWorkspaceCheckout';
import { pushCleanCheckouts } from './private/pushCleanCheckouts';

export async function runSanity(ctx: WorkspaceContext, options: { auto: boolean }): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx, records);

	const workspace = await scanWorkspaceState(ctx);
	ctx.workspace = workspace;

	await scanAllCheckoutsStates(ctx);
	await scanExtraneousCheckouts(ctx);

	if (options.auto) {
		await pullWorkspaceCheckout(ctx);
		await pushCleanCheckouts(ctx);
	}

	presentWorkspaceReport(ctx);
	presentCheckoutReport(ctx);
	presentExtraneousReport(ctx.store);
	presentOperationsReport(ctx.log);
}
