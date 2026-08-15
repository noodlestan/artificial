import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { pullCheckout } from '../../private/git/pullCheckout';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { isCleanCheckout } from '../../private/scan/isCleanCheckout';
import { scanAllCheckoutsStates } from '../../private/scan/scanAllCheckoutsStates';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { pushCheckout } from '../sanity/private/pushCheckout';

export async function runPush(ctx: WorkspaceContext): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx, records);

	await scanAllCheckoutsStates(ctx);

	for (const checkout of ctx.store.getAllCheckouts()) {
		if (isCleanCheckout(checkout) && checkout.unpushed > 0) {
			if (checkout.isBehind) {
				await pullCheckout(ctx, checkout);
			}
			const current = ctx.store.getCheckoutForLocation(checkout.record.location) ?? checkout;
			await pushCheckout(ctx, current);
		}
	}

	presentCheckoutReport(ctx);
	presentOperationsReport(ctx.log);
}
