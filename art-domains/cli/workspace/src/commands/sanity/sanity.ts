import type { WorkspaceContext } from '../../private/context/workspace-context';
import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentExtraneousReport } from '../../private/present/present-extraneous-report';
import { presentOperationsReport } from '../../private/present/present-operations-report';
import { loadCheckoutRecords } from '../../private/records/load-checkout-records';
import { loadRepositoryRecords } from '../../private/records/load-repository-rercords';
import { hydrateStoreFromRecords } from '../../private/store/hydrate-store-from-records';
import { scanAllCheckoutsStates } from '../../shared/scan-all-checkouts-states';
import { scanExtraneousCheckouts } from '../../shared/scanExtraneousCheckouts';

import { pushCleanCheckouts } from './private/push-clean-checkouts';

export async function runSanity(ctx: WorkspaceContext, options: { auto: boolean }): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx, records);

	await scanAllCheckoutsStates(ctx);
	await scanExtraneousCheckouts(ctx);

	if (options.auto) {
		await pushCleanCheckouts(ctx);
	}

	presentCheckoutReport(ctx);
	presentExtraneousReport(ctx.store);
	presentOperationsReport(ctx.log);
}
