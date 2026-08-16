import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { createOrSwitchBranch } from '../../private/git/createOrSwitchBranch';
import { createBranchFailure } from '../../private/operations/createBranchFailure';
import { createBranchSuccess } from '../../private/operations/createBranchSuccess';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { saveCheckoutRecord } from '../../private/records/checkout/saveCheckoutRecord';
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

		if (!scanned.exists) {
			ctx.log.log(createBranchFailure(branch, 'checkout not cloned', scanned));
			continue;
		}

		try {
			const outcome = await createOrSwitchBranch(scanned.path, branch);
			if (outcome === 'created') {
				ctx.log.log(createBranchSuccess(scanned, branch, `created ${branch}`));
			} else {
				ctx.log.log(createBranchSuccess(scanned, branch, `switched to ${branch}`));
			}

			const updated = { ...scanned, record: { ...scanned.record, branch } };
			ctx.store.updateCheckout(updated);
			await saveCheckoutRecord(ctx.config, updated.record.name, updated.record);
		} catch (error) {
			ctx.log.log(createBranchFailure(branch, error, scanned));
			continue;
		}
	}

	await scanAllCheckoutsStates(ctx.store);
	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
