import { join } from 'node:path';

import { loadCheckouts } from '../config/load-checkouts';
import { saveCheckoutRecord } from '../private/records/checkout-record';
import { scanCheckout } from '../shared/scan-checkout';
import type { WorkspaceContext } from '../shared/workspace-context';

import { cloneRepo } from './private/clone-repo';
import { defaultLocation } from './private/default-location';
import { presentCheckoutReport, presentOperationsReport } from './private/present';

export async function cloneSpecific(
	ctx: WorkspaceContext,
	name: string,
	target?: string,
): Promise<void> {
	const { loadRepositories } = await import('../config/load-repositories');
	const repos = loadRepositories(ctx.config, ctx.root);

	const canonical = name.startsWith('@') ? name.split('/')[1] : name;
	const repo = repos.find(r => r.name.toLowerCase() === canonical.toLowerCase());
	if (!repo) {
		console.error(`clone: unknown repo "${name}"`);
		process.exitCode = 1;
		return;
	}

	ctx.store.loadExistingCheckouts();
	const existingRecords = loadCheckouts(ctx.config, ctx.root);

	let checkout = ctx.store.findCheckout(canonical);
	if (checkout && target && checkout.record.location !== target) {
		console.error(
			`clone: ${repo.name} already exists at ${checkout.record.location}. Remove it first or use a different name.`,
		);
		process.exitCode = 1;
		return;
	}
	if (!checkout) {
		const override = existingRecords.find(r => r.repo.name === repo.name);
		const location = target ?? override?.location ?? defaultLocation(repo);
		checkout = ctx.store.addCheckout(repo, location);
	}

	const scanned = await scanCheckout(ctx, checkout);
	if (!scanned.exists) {
		const success = await cloneRepo(join(ctx.root, scanned.record.location), repo.remote);
		if (!success) {
			process.exitCode = 1;
			return;
		}
		const rescan = await scanCheckout(ctx, scanned);
		ctx.log.cloned(rescan.repo.name, 'to ' + rescan.record.location);
		const recordFile = join(
			ctx.root,
			ctx.config.records.checkouts.path,
			`${rescan.repo.name.toLowerCase().replace(/\s+/g, '-')}.art`,
		);
		const { getCurrentBranch } = await import('../private/git/get-current-branch');
		const actualBranch = await getCurrentBranch(join(ctx.root, rescan.record.location));
		saveCheckoutRecord(
			recordFile,
			{
				name: rescan.repo.name,
				location: rescan.record.location,
				branch: actualBranch || 'main',
			},
			ctx.config,
			ctx.root,
		);
	}

	presentCheckoutReport(ctx.store);
	presentOperationsReport(ctx.log);
	ctx.store.syncRecords();
}
