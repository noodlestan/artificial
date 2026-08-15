import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../context/createWorkspaceContext';
import { createPullFailure } from '../operations/createPullFailure';
import { createPullSuccess } from '../operations/createPullSuccess';
import type { Checkout } from '../store/createCheckout';

export async function pullCheckout(ctx: WorkspaceContext, checkout: Checkout): Promise<void> {
	const git = simpleGit(checkout.path);
	try {
		await git.pull('origin', checkout.record.branch);
		const updated = {
			...checkout,
			isBehind: false,
			issues: checkout.issues.filter(i => !/\d+ commit behind/.test(i)),
		};
		ctx.store.updateCheckout(updated);
		ctx.log.log(createPullSuccess(checkout, checkout.record.branch));
	} catch (error) {
		const op = createPullFailure(checkout, checkout.record.branch, error);
		const updated = {
			...checkout,
			issues: [...checkout.issues, op.message()],
		};
		ctx.store.updateCheckout(updated);
		ctx.log.log(op);
	}
}
