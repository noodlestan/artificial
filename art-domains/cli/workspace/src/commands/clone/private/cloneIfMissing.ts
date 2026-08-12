import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';
import { getCurrentBranch } from '../../../private/git/getCurrentBranch';
import { createCloneFailure } from '../../../private/operations/createCloneFailure';
import { createCloneSuccess } from '../../../private/operations/createCloneSuccess';
import { saveCheckoutRecord } from '../../../private/records/saveCheckoutRecord';
import type { Checkout } from '../../../private/store/create-checkout';
import { scanCheckoutState } from '../../../shared/scanCheckoutState';

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
