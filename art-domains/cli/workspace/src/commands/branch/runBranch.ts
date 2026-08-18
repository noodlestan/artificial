import { doBranchCheckout } from '../../private/commands/checkouts/doBranchCheckout';
import { createBranchFailure } from '../../private/commands/operations/createBranchFailure';
import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { scanCheckoutState } from '../../private/scan/scanCheckoutState';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

export async function runBranch(
	ctx: WorkspaceContext,
	options: { branch: string; checkoutLocations: string[] },
): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);

	const { branch, checkoutLocations } = options;
	const checkouts = ctx.store.getAllCheckouts();

	const locations =
		checkoutLocations.length > 0 ? checkoutLocations : checkouts.map(c => c.record.location);

	for (const location of locations) {
		const checkout = ctx.store.getCheckoutForLocation(location);
		if (!checkout) {
			ctx.log.log(createBranchFailure(branch, 'not cloned', checkout));
			continue;
		}

		const scanned = await scanCheckoutState(checkout);
		ctx.store.updateCheckout(scanned);

		if (!scanned.scan?.can?.('branch')) {
			ctx.log.log(createBranchFailure(branch, 'checkout not cloned', scanned));
			continue;
		}

		await doBranchCheckout(ctx, scanned, branch);
	}

	await scanAllCheckoutsStates(ctx.store);
	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
