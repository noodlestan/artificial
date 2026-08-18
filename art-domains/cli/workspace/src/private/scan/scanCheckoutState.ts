import { access } from 'node:fs/promises';

import { getBehindCount } from '../git/getBehindCount';
import { getCurrentBranch } from '../git/getCurrentBranch';
import { getRemoteBranch } from '../git/getRemoteBranch';
import { getUnpushedCount } from '../git/getUnpushedCount';
import { hasMergeConflicts } from '../git/hasMergeConflicts';
import { hasRemote } from '../git/hasRemote';
import { isDetachedHead } from '../git/isDetachedHead';
import { isDirty } from '../git/isDirty';
import type { Checkout } from '../store/types';

import {
	createCheckoutNoClonedScan,
	createCheckoutScan,
	createCommittedState,
	createExistsState,
	createNoConflictsState,
	createNoDetachedState,
	createRemoteState,
	createRepoState,
	createSyncState,
} from './types';

export async function scanCheckoutState(checkout: Checkout): Promise<Checkout> {
	try {
		await access(checkout.path);
	} catch {
		return { ...checkout, scan: createCheckoutNoClonedScan(Boolean(checkout.repo)) };
	}

	let branch: string | null = null;
	let remoteBranch: string | null = null;
	let remote = false;
	let dirty = false;
	let conflicts = false;
	let detached = false;
	let ahead = 0;
	let behind = 0;
	try {
		branch = await getCurrentBranch(checkout.path);
		remote = await hasRemote(checkout.path);
		detached = await isDetachedHead(checkout.path);
		conflicts = await hasMergeConflicts(checkout.path);
		dirty = await isDirty(checkout.path);
		if (remote && branch !== '-' && branch !== 'HEAD') {
			remoteBranch = await getRemoteBranch(checkout.path);
			ahead = await getUnpushedCount(checkout.path, remoteBranch);
			behind = remoteBranch ? await getBehindCount(checkout.path, remoteBranch) : 0;
		}
	} catch {
		// The derived states still provide a useful report when git inspection fails.
	}

	const remoteState = createRemoteState(branch, checkout.record.branch, remote);
	const scan = createCheckoutScan([
		createRepoState(Boolean(checkout.repo)),
		createExistsState(true),
		remoteState,
		createSyncState(ahead - behind, ahead, behind),
		createCommittedState(!dirty),
		createNoConflictsState(!conflicts),
		createNoDetachedState(!detached),
	]);
	return { ...checkout, scan };
}
