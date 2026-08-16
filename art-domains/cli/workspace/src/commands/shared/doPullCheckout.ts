import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { pullCheckout } from '../../private/git/pullCheckout';
import { createPullFailure } from '../../private/operations/createPullFailure';
import { createPullSuccess } from '../../private/operations/createPullSuccess';
import type { Checkout } from '../../private/store/createCheckout';

export async function doPullCheckout(ctx: WorkspaceContext, checkout: Checkout): Promise<void> {
	const result = await pullCheckout(checkout);
	ctx.store.updateCheckout(result.checkout);
	if (result.success) {
		ctx.log.log(createPullSuccess(checkout, checkout.record.branch));
	} else {
		const op = createPullFailure(checkout, checkout.record.branch, result.error);
		const updated: Checkout = {
			...result.checkout,
			issues: [...result.checkout.issues, op.message()],
		};
		ctx.store.updateCheckout(updated);
		ctx.log.log(op);
	}
}
