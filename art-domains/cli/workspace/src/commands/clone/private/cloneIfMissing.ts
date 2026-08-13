import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';
import { getCurrentBranch } from '../../../private/git/getCurrentBranch';
import { createCloneFailure } from '../../../private/operations/createCloneFailure';
import { createCloneSuccess } from '../../../private/operations/createCloneSuccess';
import { saveCheckoutRecord } from '../../../private/records/checkout/saveCheckoutRecord';
import { scanCheckoutState } from '../../../private/scan/scanCheckoutState';
import type { Checkout } from '../../../private/store/createCheckout';

export async function cloneIfMissing(
	ctx: WorkspaceContext,
	checkout: Checkout,
): Promise<Checkout | null> {
	const scanned = await scanCheckoutState(ctx, checkout);
	if (scanned.exists) {
		return scanned;
	}

	if (!scanned.repo) {
		return null;
	}

	try {
		const git = simpleGit('');
		await git.clone(scanned.repo.remote, scanned.path);
	} catch (error) {
		ctx.log.log(createCloneFailure(scanned, error));
		return null;
	}

	const rescan = await scanCheckoutState(ctx, scanned);
	ctx.log.log(createCloneSuccess(rescan));

	const actualBranch = await getCurrentBranch(scanned.path);
	await saveCheckoutRecord(ctx.config, rescan.record.name, {
		name: rescan.record.name,
		repository: rescan.repo?.name,
		location: rescan.record.location,
		branch: actualBranch || 'main',
	});

	return rescan;
}
