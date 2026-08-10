import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import type { WorkspaceConfig } from '../config/types';
import { getCurrentBranch, isDetachedHead } from './branching';
import type { CheckoutStore } from './checkout-store';
import {
	getUnpushedCount,
	hasMergeConflicts,
	hasRemote,
	isDirty,
} from './validate';

export async function scanCheckout(
	store: CheckoutStore,
	name: string,
	root: string,
): Promise<void> {
	const checkout = store.getCheckout(name);
	if (!checkout) {
		return;
	}

	const dir = join(root, checkout.location);

	try {
		const stat = statSync(dir);
		if (!stat.isDirectory()) {
			checkout.exists = false;
			checkout.issues = ['repo not cloned'];
			return;
		}
	} catch {
		checkout.exists = false;
		checkout.issues = ['repo not cloned'];
		return;
	}

	checkout.exists = true;

	const issues: string[] = [];

	try {
		checkout.branch = await getCurrentBranch(dir);
		checkout.detached = await isDetachedHead(dir);
		checkout.conflicts = await hasMergeConflicts(dir);
		checkout.dirty = await isDirty(dir);
		checkout.hasRemote = await hasRemote(dir);

		if (checkout.hasRemote && checkout.branch !== '-' && checkout.branch !== 'HEAD') {
			checkout.unpushed = await getUnpushedCount(dir);
		}
	} catch {
		issues.push('git error');
	}

	if (checkout.detached) {
		issues.push('detached HEAD');
	}
	if (checkout.conflicts) {
		issues.push('merge conflicts');
	}
	if (!checkout.hasRemote) {
		issues.push('no remote');
	}
	if (checkout.dirty) {
		issues.push('uncommitted files');
	}
	if (checkout.unpushed === -1) {
		issues.push('not pushed');
	} else if (checkout.unpushed > 0) {
		issues.push(`${checkout.unpushed} commit${checkout.unpushed !== 1 ? 's' : ''} ahead`);
	}

	checkout.issues = issues;

	if (!checkout.hasRemote) {
		checkout.pushed = 'no';
	} else if (checkout.dirty || checkout.unpushed !== 0) {
		checkout.pushed = 'no';
	} else {
		checkout.pushed = 'yes';
	}
}

export async function scanAllCheckouts(
	store: CheckoutStore,
	root: string,
): Promise<void> {
	for (const checkout of store.getAllCheckouts()) {
		await scanCheckout(store, checkout.name, root);
	}
}

export async function scanExtraneousCheckouts(
	store: CheckoutStore,
	config: WorkspaceConfig,
	root: string,
): Promise<void> {
	const checkoutsPath = join(root, config.records.checkouts.path);
	const recordedLocations = store.getAllCheckouts().map(c => c.location);

	try {
		const entries = readdirSync(checkoutsPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}
			const dir = join(checkoutsPath, entry.name);
			const location = relative(root, dir);
			if (!recordedLocations.includes(location)) {
				store.markExtraneous(location);
				const name = entry.name;
				await scanCheckout(store, name, root);
			}
		}
	} catch {
		// checkouts path doesn't exist or can't be read
	}
}
