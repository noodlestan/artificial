import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';
import { createPushFailure } from '../../../private/operations/createPushFailure';
import { createPushSuccess } from '../../../private/operations/createPushSuccess';
import { type Checkout } from '../../../private/store/createCheckout';

export async function pushCheckout(ctx: WorkspaceContext, checkout: Checkout): Promise<void> {
	const git = simpleGit(checkout.path);
	try {
		await git.push('origin', checkout.record.branch);
		const updated = {
			...checkout,
			scan: checkout.scan && {
				...checkout.scan,
				unpushed: 0,
				issues: checkout.scan.issues.filter(i => !/\d+ commit/.test(i)),
			},
		};
		ctx.store.updateCheckout(updated);
		ctx.log.log(createPushSuccess(checkout, checkout.record.branch));
	} catch (error) {
		const op = createPushFailure(checkout, checkout.record.branch, error);
		const updated = {
			...checkout,
			scan: checkout.scan && { ...checkout.scan, issues: [...checkout.scan.issues, op.message()] },
		};
		ctx.store.updateCheckout(updated);
		ctx.log.log(op);
	}
}
