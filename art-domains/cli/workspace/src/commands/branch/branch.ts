import type { WorkspaceContext } from '../../private/context/workspace-context';
import { createBranchFailure } from '../../private/operations/create-branch-failure';
import { createBranchSuccess } from '../../private/operations/create-branch-success';
import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentOperationsReport } from '../../private/present/present-operations-report';
import { loadCheckoutRecords } from '../../private/records/load-checkout-records';
import { loadRepositoryRecords } from '../../private/records/load-repository-rercords';
import { saveCheckoutRecord } from '../../private/records/save-checkout-record';
import { hydrateStoreFromRecords } from '../../private/store/hydrate-store-from-records';
import { scanCheckoutState } from '../../shared/scan-checkout-state';

import { createOrSwitchBranch } from './private/create-or-switch-branch';

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
