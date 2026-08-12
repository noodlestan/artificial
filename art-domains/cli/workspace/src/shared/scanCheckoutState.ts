import { access } from 'node:fs/promises';

import type { WorkspaceContext } from '../private/context/createWorkspaceContext';
import { getCurrentBranch } from '../private/git/getCurrentBranch';
import { getRemoteBranch } from '../private/git/getRemoteBranch';
import { getUnpushedCount } from '../private/git/getUnpushedCount';
import { hasRemote } from '../private/git/has-remote';
import { hasMergeConflicts } from '../private/git/hasMergeConflicts';
import { isDirty } from '../private/git/is-dirty';
import { isDetachedHead } from '../private/git/isDetachedHead';
import type { Checkout } from '../private/store/create-checkout';

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

	try {
		branch = await getCurrentBranch(checkout.path);
		isDifferentBranch = branch !== checkout.record.branch;

		detached = await isDetachedHead(checkout.path);
		conflicts = await hasMergeConflicts(checkout.path);
		dirty = await isDirty(checkout.path);
		hasRemoteVal = await hasRemote(checkout.path);

		if (hasRemoteVal && branch !== '-' && branch !== 'HEAD') {
			remoteBranch = await getRemoteBranch(checkout.path);
			unpushed = await getUnpushedCount(checkout.path, remoteBranch);
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
		issues,
	};

	ctx.store.updateCheckout(updated);
	return updated;
}
