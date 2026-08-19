import { doPullCheckout } from '../../private/commands/checkouts/doPullCheckout';
import { doPushCheckout } from '../../private/commands/checkouts/doPushCheckout';
import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

export async function runPush(ctx: WorkspaceContext): Promise<void> {
	const repos = await loadRepositoryRecords(ctx.config);
	const records = await loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);

	await scanAllCheckoutsStates(ctx.store);

	for (const checkout of ctx.store.getAllCheckouts()) {
		if (checkout.scan?.can?.('push') && checkout.scan.should?.('push')) {
			if (checkout.scan.should?.('pull')) {
				await doPullCheckout(ctx, checkout);
			}
			const current = ctx.store.getCheckoutForLocation(checkout.record.location) ?? checkout;
			await doPushCheckout(ctx, current);
		}
	}

	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
