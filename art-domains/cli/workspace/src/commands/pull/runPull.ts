import { doPullCheckout } from '../../private/commands/checkouts/doPullCheckout';
import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/resources/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/resources/repository/loadRepositoryRecords';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

export async function runPull(ctx: WorkspaceContext): Promise<void> {
	const repos = await loadRepositoryRecords(ctx.config);
	const records = await loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);

	await scanAllCheckoutsStates(ctx.store);

	for (const checkout of ctx.store.getAllCheckouts()) {
		if (checkout.scan?.can?.('pull') && checkout.scan.should?.('pull')) {
			await doPullCheckout(ctx, checkout);
		}
	}

	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
