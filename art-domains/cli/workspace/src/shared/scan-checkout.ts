import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { getCurrentBranch } from '../private/git/get-current-branch';
import { getUnpushedCount } from '../private/git/get-unpushed-count';
import { hasMergeConflicts } from '../private/git/has-merge-conflicts';
import { hasRemote } from '../private/git/has-remote';
import { isDetachedHead } from '../private/git/is-detached-head';
import { isDirty } from '../private/git/is-dirty';

import type { Checkout } from './checkout';
import type { WorkspaceContext } from './workspace-context';

export async function scanCheckout(ctx: WorkspaceContext, checkout: Checkout): Promise<Checkout> {
	const dir = join(ctx.root, checkout.record.location);

	try {
		const stat = statSync(dir);
		if (!stat.isDirectory()) {
			const updated = { ...checkout, exists: false, issues: ['repo not cloned'] };
			ctx.store.setCheckout(updated);
			return updated;
		}
	} catch {
		const updated = { ...checkout, exists: false, issues: ['repo not cloned'] };
		ctx.store.setCheckout(updated);
		return updated;
	}

	const issues: string[] = [];
	let branch = checkout.record.branch;
	let detached = false;
	let conflicts = false;
	let dirty = false;
	let hasRemoteVal = false;
	let unpushed = 0;

	try {
		branch = await getCurrentBranch(dir);
		detached = await isDetachedHead(dir);
		conflicts = await hasMergeConflicts(dir);
		dirty = await isDirty(dir);
		hasRemoteVal = await hasRemote(dir);

		if (hasRemoteVal && branch !== '-' && branch !== 'HEAD') {
			unpushed = await getUnpushedCount(dir);
		}
	} catch {
		issues.push('git error');
	}

	if (detached) {
		issues.push('detached HEAD');
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
	if (unpushed === -1) {
		issues.push('not pushed');
	} else if (unpushed > 0) {
		issues.push(`${unpushed} commit${unpushed !== 1 ? 's' : ''} ahead`);
	}

	const updated: Checkout = {
		...checkout,
		exists: true,
		branch,
		detached,
		conflicts,
		dirty,
		hasRemote: hasRemoteVal,
		unpushed,
		issues,
	};

	ctx.store.setCheckout(updated);
	return updated;
}

export async function scanAllCheckouts(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		await scanCheckout(ctx, checkout);
	}
}

export async function scanExtraneousCheckouts(ctx: WorkspaceContext): Promise<void> {
	const checkoutsPath = join(ctx.root, ctx.config.records.checkouts.path);
	const recordedLocations = ctx.store.getAllCheckouts().map(c => c.record.location);

	try {
		const entries = readdirSync(checkoutsPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}
			const dir = join(checkoutsPath, entry.name);
			const location = relative(ctx.root, dir);
			if (!recordedLocations.includes(location)) {
				const checkout = ctx.store.markExtraneous(location);
				await scanCheckout(ctx, checkout);
			}
		}
	} catch {
		// checkouts path doesn't exist or can't be read
	}
}
