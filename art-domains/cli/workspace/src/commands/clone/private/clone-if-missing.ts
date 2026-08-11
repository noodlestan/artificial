import { join } from 'node:path';

import simpleGit from 'simple-git';

import { createCloneFailure } from '../../../private/operations/create-clone-failure';
import { createCloneSuccess } from '../../../private/operations/create-clone-success';
import { saveCheckoutRecord } from '../../../private/records/checkout-record';
import type { Checkout } from '../../../shared/checkout';
import { scanCheckout } from '../../../shared/scan-checkout';
import type { WorkspaceContext } from '../../../shared/workspace-context';

export async function cloneIfMissing(
	ctx: WorkspaceContext,
	checkout: Checkout,
): Promise<Checkout | null> {
	const scanned = await scanCheckout(ctx, checkout);
	if (scanned.exists) {
		return scanned;
	}

	try {
		const git = simpleGit('');
		await git.clone(scanned.repo.remote, join(ctx.root, scanned.record.location));
	} catch (error) {
		ctx.log.log(createCloneFailure(scanned, error));
		return null;
	}

	const rescan = await scanCheckout(ctx, scanned);
	ctx.log.log(createCloneSuccess(rescan));

	const recordFile = join(
		ctx.root,
		ctx.config.records.checkouts.path,
		`${rescan.record.name.toLowerCase().replace(/\s+/g, '-')}.art`,
	);
	const { getCurrentBranch } = await import('../../../private/git/get-current-branch');
	const actualBranch = await getCurrentBranch(join(ctx.root, rescan.record.location));
	saveCheckoutRecord(
		recordFile,
		{
			name: rescan.repo.name,
			repository: `Repository: ${rescan.repo.name}`,
			location: rescan.record.location,
			branch: actualBranch || 'main',
		},
		ctx.config,
		ctx.root,
	);

	return rescan;
}
