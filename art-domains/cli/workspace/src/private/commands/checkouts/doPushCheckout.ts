import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../context/createWorkspaceContext';
import { scanCheckoutState } from '../../scan/scanCheckoutState';
import { type Checkout } from '../../store/createCheckout';
import { createPushFailure } from '../operations/createPushFailure';
import { createPushSuccess } from '../operations/createPushSuccess';

export async function doPushCheckout(
	ctx: WorkspaceContext,
	checkout: Checkout,
): Promise<Checkout | null> {
	const git = simpleGit(checkout.path);
	try {
		await git.push('origin', checkout.record.branch);
		const updated = await scanCheckoutState(checkout);
		ctx.store.updateCheckout(updated);
		ctx.log.log(createPushSuccess(checkout, checkout.record.branch));
		return updated;
	} catch (error) {
		const op = createPushFailure(checkout, checkout.record.branch, error);
		ctx.log.log(op);
		return null;
	}
}
