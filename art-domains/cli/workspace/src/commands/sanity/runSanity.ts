import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentExtraneousReport } from '../../private/present/presentExtraneousReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/loadRepositoryRecords';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../shared/scanAllCheckoutsStates';
import { scanExtraneousCheckouts } from '../../shared/scanExtraneousCheckouts';

import { pushCleanCheckouts } from './private/pushCleanCheckouts';

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
