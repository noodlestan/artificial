import { join } from 'node:path';

import { loadCheckouts } from '../../config/load-checkouts';
import { saveCheckoutRecord } from '../../private/records/checkout-record';
import { scanCheckout } from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';

import { cloneRepo } from './private/clone-repo';
import { defaultLocation } from './private/default-location';
import { presentCheckoutReport, presentOperationsReport } from './private/present';

export async function cloneAll(ctx: WorkspaceContext): Promise<void> {
	const { loadRepositories } = await import('../../config/load-repositories');
	const repos = loadRepositories(ctx.config, ctx.root);

	ctx.store.loadExistingCheckouts();
	const existingRecords = loadCheckouts(ctx.config, ctx.root);

	for (const repo of repos) {
		if (!ctx.store.findCheckout(repo.name)) {
			const override = existingRecords.find(r => r.repo.name === repo.name);
			const location = override?.location ?? defaultLocation(repo);
			ctx.store.addCheckout(repo, location);
		}
	}

	for (const checkout of ctx.store.getAllCheckouts()) {
		const scanned = await scanCheckout(ctx, checkout);
		if (!scanned.exists) {
			const success = await cloneRepo(join(ctx.root, scanned.record.location), scanned.repo.remote);
			if (success) {
				const rescan = await scanCheckout(ctx, scanned);
				ctx.log.cloned(rescan.repo.name, 'to ' + rescan.record.location);
				const recordFile = join(
					ctx.root,
					ctx.config.records.checkouts.path,
					`${rescan.repo.name.toLowerCase().replace(/\s+/g, '-')}.art`,
				);
				const { getCurrentBranch } = await import('../../private/git/get-current-branch');
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
		}
	}

	presentCheckoutReport(ctx.store);
	presentOperationsReport(ctx.log);
	ctx.store.syncRecords();
}
