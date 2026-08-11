import { join } from 'node:path';

import simpleGit from 'simple-git';

import {
	scanAllCheckouts,
	scanCheckout,
	scanExtraneousCheckouts,
} from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';
import {
	presentCheckoutReport,
	presentExtraneousReport,
	presentOperationsReport,
} from '../clone/private/present';

const WORKSPACE_REPO = {
	name: 'Workspace',
	purpose: 'Workspace meta-repo',
	remote: 'git@github.com:noodlestan/workspace.git',
};

export async function runSanity(ctx: WorkspaceContext, auto: boolean): Promise<void> {
	ctx.store.loadExistingCheckouts();

	// Add workspace root as a checkout
	const wsCheckout = ctx.store.addCheckout(WORKSPACE_REPO, '.');
	await scanCheckout(ctx, wsCheckout);

	await scanAllCheckouts(ctx);
	await scanExtraneousCheckouts(ctx);

	if (auto) {
		for (const checkout of ctx.store.getAllCheckouts()) {
			if (!checkout.exists) continue;
			if (checkout.extraneous) continue;
			if (
				checkout.issues.some(
					i =>
						i.includes('uncommitted') ||
						i.includes('merge conflicts') ||
						i.includes('detached HEAD'),
				)
			)
				continue;
			if (checkout.unpushed === 0 || checkout.unpushed === -1) continue;
			if (checkout.issues.some(i => i.includes('no remote'))) continue;

			const dir = join(ctx.root, checkout.record.location);
			const git = simpleGit(dir);
			try {
				await git.push('origin', checkout.branch);
				const updated = {
					...checkout,
					unpushed: 0,
					issues: checkout.issues.filter(i => !/\d+ commit/.test(i) && i !== 'not pushed'),
				};
				ctx.store.setCheckout(updated);
				ctx.log.pushed(checkout.repo.name, 'to origin/' + checkout.branch);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				const updated = {
					...checkout,
					issues: [...checkout.issues, `push failed: ${msg}`],
				};
				ctx.store.setCheckout(updated);
				ctx.log.pushed(checkout.repo.name, `FAILED — ${msg}`);
			}
		}
	}

	presentCheckoutReport(ctx.store);
	presentExtraneousReport(ctx.store);
	presentOperationsReport(ctx.log);

	if (auto) {
		ctx.store.syncRecords();
	}
}
