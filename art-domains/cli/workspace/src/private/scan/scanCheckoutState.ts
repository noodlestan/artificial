import { access } from 'node:fs/promises';

import type { WorkspaceContext } from '../context/createWorkspaceContext';
import { getBehindCount } from '../git/getBehindCount';
import { getCurrentBranch } from '../git/getCurrentBranch';
import { getRemoteBranch } from '../git/getRemoteBranch';
import { getUnpushedCount } from '../git/getUnpushedCount';
import { hasMergeConflicts } from '../git/hasMergeConflicts';
import { hasRemote } from '../git/hasRemote';
import { isDetachedHead } from '../git/isDetachedHead';
import { isDirty } from '../git/isDirty';
import type { Checkout } from '../store/createCheckout';

export async function scanCheckoutState(
	ctx: WorkspaceContext,
	checkout: Checkout,
): Promise<Checkout> {
	let dirExists = false;
	try {
		await access(checkout.path);
		dirExists = true;
	} catch {
		dirExists = false;
	}

	if (!dirExists) {
		const updated = { ...checkout, exists: false, issues: ['not cloned'] };
		ctx.store.updateCheckout(updated);
		return updated;
	}

	const issues: string[] = [];
	let branch = checkout.record.branch;
	let isDifferentBranch = false;
	let detached = false;
	let conflicts = false;
	let dirty = false;
	let hasRemoteVal = false;
	let remoteBranch: string | null = null;
	let unpushed = 0;
	let isBehind = false;
	let behindCount = 0;

	try {
		branch = await getCurrentBranch(checkout.path);
		isDifferentBranch = branch !== checkout.record.branch;

		detached = await isDetachedHead(checkout.path);
		conflicts = await hasMergeConflicts(checkout.path);
		dirty = await isDirty(checkout.path);
		hasRemoteVal = await hasRemote(checkout.path);

		if (hasRemoteVal && branch !== '-' && branch !== 'HEAD') {
			const trackingBranch = await getRemoteBranch(checkout.path);
			remoteBranch = trackingBranch;
			unpushed = await getUnpushedCount(checkout.path, trackingBranch);
			if (trackingBranch) {
				behindCount = await getBehindCount(checkout.path, trackingBranch);
			}
			isBehind = behindCount > 0;
		}
	} catch {
		issues.push('git error');
	}

	if (!checkout.repo) {
		issues.unshift('unknown project');
	}
	if (detached) {
		issues.push('detached HEAD');
	}
	if (!detached && isDifferentBranch) {
		issues.push('wrong branch');
	}
	if (conflicts) {
		issues.push('merge conflicts');
	}
	if (!hasRemoteVal) {
		issues.push('no remote');
	}
	if (dirty) {
		issues.push('uncommitted files');
	}
	if (unpushed > 0) {
		issues.push(`${unpushed} commit${unpushed !== 1 ? 's' : ''} ahead`);
	}
	if (isBehind) {
		issues.push(`${behindCount} commit${behindCount !== 1 ? 's' : ''} behind`);
	}

	const updated: Checkout = {
		...checkout,
		record: {
			...checkout.record,
			branch,
		},
		exists: true,
		remoteBranch,
		detached,
		conflicts,
		dirty,
		hasRemote: hasRemoteVal,
		unpushed,
		isBehind,
		issues,
	};

	ctx.store.updateCheckout(updated);
	return updated;
}
