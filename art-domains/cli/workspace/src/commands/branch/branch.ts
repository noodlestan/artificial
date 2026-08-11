import { join } from 'node:path';

import { createBranchFailure } from '../../private/operations/create-branch-failure';
import { createBranchSuccess } from '../../private/operations/create-branch-success';
import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentOperationsReport } from '../../private/present/present-operations-report';
import { scanCheckout } from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';

import { createOrSwitchBranch } from './private/create-or-switch-branch';

export async function runBranch(
	ctx: WorkspaceContext,
	branch: string,
	checkoutNames: string[],
): Promise<void> {
	ctx.store.loadExistingCheckouts();
	const checkouts = ctx.store.getAllCheckouts();
	const targets = checkoutNames.length > 0 ? checkoutNames : checkouts.map(c => c.record.name);

	for (const checkoutName of targets) {
		let checkout = ctx.store.findCheckout(checkoutName);
		if (!checkout) {
			console.warn('unknown checkout: ' + checkoutName);
			continue;
		}

		checkout = await scanCheckout(ctx, checkout);
		if (!checkout.exists) {
			ctx.log.log(createBranchFailure(checkout, branch, new Error('checkout not cloned')));
			continue;
		}

		const dir = join(ctx.root, checkout.record.location);
		try {
			const outcome = await createOrSwitchBranch(dir, branch);
			if (outcome === 'created') {
				ctx.log.log(createBranchSuccess(checkout, branch));
			} else {
				ctx.log.log(createBranchSuccess(checkout, branch, `switched to ${branch}`));
			}
		} catch (error) {
			ctx.log.log(createBranchFailure(checkout, branch, error));
			continue;
		}

		ctx.store.setCheckout({ ...checkout, branch, record: { ...checkout.record, branch } });
	}

	presentCheckoutReport(ctx.store);
	presentOperationsReport(ctx.log);
	ctx.store.syncRecords();
}
