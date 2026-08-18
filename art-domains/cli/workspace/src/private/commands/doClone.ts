import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../context/createWorkspaceContext';
import { getCurrentBranch } from '../git/getCurrentBranch';
import { saveCheckoutRecord } from '../records/checkout/saveCheckoutRecord';
import { scanCheckoutState } from '../scan/scanCheckoutState';
import type { Checkout } from '../store/createCheckout';

import { createCloneFailure } from './operations/createCloneFailure';
import { createCloneSuccess } from './operations/createCloneSuccess';

export async function doClone(ctx: WorkspaceContext, checkout: Checkout): Promise<Checkout | null> {
	if (!checkout.repo) return null;

	try {
		const git = simpleGit('');
		await git.clone(checkout.repo.remote, checkout.path);

		const rescan = await scanCheckoutState(checkout);
		ctx.store.updateCheckout(rescan);
		ctx.log.log(createCloneSuccess(rescan));

		const actualBranch = await getCurrentBranch(checkout.path);
		await saveCheckoutRecord(ctx.config, rescan.record.name, {
			name: rescan.record.name,
			repository: rescan.repo?.name,
			location: rescan.record.location,
			branch: actualBranch || 'main',
		});

		return rescan;
	} catch (error) {
		ctx.log.log(createCloneFailure(checkout, error));
		return null;
	}
}
