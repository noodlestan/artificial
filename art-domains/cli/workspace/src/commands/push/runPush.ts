import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { isCleanCheckout } from '../../private/scan/isCleanCheckout';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';
import { pushCheckout } from '../sanity/private/pushCheckout';
import { doPullCheckout } from '../shared/doPullCheckout';

export async function runPush(ctx: WorkspaceContext): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);

	await scanAllCheckoutsStates(ctx.store);

	for (const checkout of ctx.store.getAllCheckouts()) {
		if (isCleanCheckout(checkout) && checkout.unpushed > 0) {
			if (checkout.isBehind) {
				await doPullCheckout(ctx, checkout);
			}
			const current = ctx.store.getCheckoutForLocation(checkout.record.location) ?? checkout;
			await pushCheckout(ctx, current);
		}
	}

	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
