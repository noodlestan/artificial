import { join } from 'node:path';

import simpleGit from 'simple-git';

import { createPushFailure } from '../../../private/operations/create-push-failure';
import { createPushSuccess } from '../../../private/operations/create-push-success';
import type { Checkout } from '../../../shared/checkout';
import type { WorkspaceContext } from '../../../shared/workspace-context';

export async function pushCheckout(ctx: WorkspaceContext, checkout: Checkout): Promise<void> {
	const dir = join(ctx.root, checkout.record.location);
	const git = simpleGit(dir);
	try {
		await git.push('origin', checkout.branch);
		const updated = {
			...checkout,
			unpushed: 0,
			issues: checkout.issues.filter(i => !/\d+ commit/.test(i)),
		};
		ctx.store.setCheckout(updated);
		ctx.log.log(createPushSuccess(checkout, checkout.branch));
	} catch (error) {
		const op = createPushFailure(checkout, checkout.branch, error);
		const updated = {
			...checkout,
			issues: [...checkout.issues, op.message()],
		};
		ctx.store.setCheckout(updated);
		ctx.log.log(op);
	}
}
