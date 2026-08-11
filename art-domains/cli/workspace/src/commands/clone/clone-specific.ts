import { loadCheckouts } from '../../config/load-checkouts';
import { createCloneFailure } from '../../private/operations/create-clone-failure';
import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentOperationsReport } from '../../private/present/present-operations-report';
import { scanCheckout } from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';

import { cloneIfMissing } from './private/clone-if-missing';
import { defaultLocation } from './private/default-location';

export async function cloneSpecific(
	ctx: WorkspaceContext,
	name: string,
	target?: string,
): Promise<void> {
	const { loadRepositories } = await import('../../config/load-repositories');
	const repos = loadRepositories(ctx.config, ctx.root);

	const canonical = name.startsWith('@') ? name.split('/')[1] : name;
	const repo = repos.find(r => r.name.toLowerCase() === canonical.toLowerCase());
	if (!repo) {
		const checkout =
			ctx.store.getAllCheckouts()[0] ?? ctx.store.addCheckout({ name: 'unknown', remote: '' }, '.');
		ctx.log.log(createCloneFailure(checkout, `unknown repo "${name}"`));
		return;
	}

	ctx.store.loadExistingCheckouts();
	const existingRecords = loadCheckouts(ctx.config, ctx.root);

	let checkout = ctx.store.findCheckout(canonical);
	if (checkout && target && checkout.record.location !== target) {
		const msg = `already exists at ${checkout.record.location}. Remove it first or use a different name.`;
		const op = createCloneFailure(checkout, msg);
		ctx.log.log(op);
		return;
	}
	if (!checkout) {
		const override = existingRecords.find(r => r.repo.name === repo.name);
		const location = target ?? override?.location ?? defaultLocation(repo);
		checkout = ctx.store.addCheckout(repo, location);
	}

	const scanned = await scanCheckout(ctx, checkout);
	const rescan = await cloneIfMissing(ctx, scanned);
	if (!rescan) {
		return;
	}

	presentCheckoutReport(ctx.store);
	presentOperationsReport(ctx.log);
	ctx.store.syncRecords();
}
