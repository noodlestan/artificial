import { join } from 'node:path';

import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../../private/context/workspace-context';
import { getCurrentBranch } from '../../../private/git/get-current-branch';
import { createCloneFailure } from '../../../private/operations/create-clone-failure';
import { createCloneSuccess } from '../../../private/operations/create-clone-success';
import { saveCheckoutRecord } from '../../../private/records/save-checkout-record';
import type { Checkout } from '../../../private/store/create-checkout';
import { scanCheckoutState } from '../../../shared/scan-checkout-state';

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

	const recordFile = join(
		ctx.config.root.path,
		ctx.config.records.checkouts.path,
		`${rescan.record.name.toLowerCase().replace(/\s+/g, '-')}.art`,
	);
	const actualBranch = await getCurrentBranch(scanned.path);
	saveCheckoutRecord(ctx.config, recordFile, {
		name: rescan.record.name,
		repository: `Repository: ${rescan.repo?.name}`,
		location: rescan.record.location,
		branch: actualBranch || 'main',
	});

	return rescan;
}
