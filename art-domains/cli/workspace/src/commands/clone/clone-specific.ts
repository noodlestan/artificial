import { basename, join } from 'node:path';

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

	// Derive checkout name: repo-name (default) or repo-name-location (custom)
	const locationBasename = target ? basename(target) : repo.name.toLowerCase().replace(/\s+/g, '-');
	const checkoutName = target ? `${repo.name}-${locationBasename}` : repo.name;
	const resolvedLocation = target
		? join(ctx.config.clone.path, locationBasename)
		: defaultLocation(repo);

	// Find existing by checkout name
	let checkout = ctx.store.findCheckout(checkoutName);
	if (checkout && checkout.record.location !== resolvedLocation) {
		const msg = `checkout for '${repo.name}' exists at ${checkout.record.location}. Cannot clone to ${resolvedLocation}.`;
		ctx.log.log(createCloneFailure(checkout, msg));
		return;
	}
	if (!checkout) {
		// Check if location is taken by a different checkout
		const allCheckouts = ctx.store.getAllCheckouts();
		const conflicting = allCheckouts.find(c => c.record.location === resolvedLocation);
		if (conflicting) {
			const msg = `location ${resolvedLocation} is already used by checkout '${conflicting.record.name}'.`;
			ctx.log.log(createCloneFailure(conflicting, msg));
			return;
		}
		checkout = ctx.store.addCheckout(repo, resolvedLocation, checkoutName);
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
