import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { createBranchFailure } from '../../private/operations/createBranchFailure';
import { createBranchSuccess } from '../../private/operations/createBranchSuccess';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { loadCheckoutRecords } from '../../private/records/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/loadRepositoryRecords';
import { saveCheckoutRecord } from '../../private/records/saveCheckoutRecord';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanCheckoutState } from '../../shared/scanCheckoutState';

import { createOrSwitchBranch } from './private/createOrSwitchBranch';

export async function runBranch(
	ctx: WorkspaceContext,
	options: { branch: string; checkoutLocations: string[] },
): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx, records);

	const { branch, checkoutLocations } = options;
	const checkouts = ctx.store.getAllCheckouts();

	const locations =
		checkoutLocations.length > 0 ? checkoutLocations : checkouts.map(c => c.record.location);

	for (const location of locations) {
		let checkout = ctx.store.getCheckoutForLocation(location);
		if (!checkout) {
			ctx.log.log(createBranchFailure(branch, 'not cloned', checkout));
			continue;
		}

		checkout = await scanCheckoutState(ctx, checkout);
		if (!checkout) {
			ctx.log.log(createBranchFailure(branch, 'uknown checkout', checkout));
			continue;
		}
		if (!checkout.exists) {
			ctx.log.log(createBranchFailure(branch, 'checkout not clond', checkout));
			continue;
		}

		try {
			const outcome = await createOrSwitchBranch(checkout.path, branch);
			if (outcome === 'created') {
				ctx.log.log(createBranchSuccess(checkout, branch, `created ${branch}`));
			} else {
				ctx.log.log(createBranchSuccess(checkout, branch, `switched to ${branch}`));
			}

			const updated = { ...checkout, record: { ...checkout.record, branch } };
			ctx.store.updateCheckout(updated);
			const scanned = await scanCheckoutState(ctx, updated);
			await saveCheckoutRecord(ctx.config, scanned.record.name, scanned.record);
		} catch (error) {
			ctx.log.log(createBranchFailure(branch, error, checkout));
			continue;
		}
	}

	presentCheckoutReport(ctx);
	presentOperationsReport(ctx.log);
}
