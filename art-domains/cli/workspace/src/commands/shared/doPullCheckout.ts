import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { pullCheckout } from '../../private/git/pullCheckout';
import { createPullFailure } from '../../private/operations/createPullFailure';
import { createPullSuccess } from '../../private/operations/createPullSuccess';
import type { Checkout } from '../../private/store/createCheckout';

export async function doPullCheckout(ctx: WorkspaceContext, checkout: Checkout): Promise<void> {
	try {
		const updated = await pullCheckout(checkout);
		ctx.store.updateCheckout(updated);
		ctx.log.log(createPullSuccess(checkout, checkout.record.branch));
	} catch (error) {
		const op = createPullFailure(checkout, checkout.record.branch, error);
		const updated: Checkout = {
			...checkout,
			issues: [...checkout.issues, op.message()],
		};
		ctx.store.updateCheckout(updated);
		ctx.log.log(op);
	}
}
