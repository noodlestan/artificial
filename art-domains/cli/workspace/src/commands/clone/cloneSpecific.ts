import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { createCloneFailure } from '../../private/operations/createCloneFailure';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { saveCheckoutRecord } from '../../private/records/checkout/saveCheckoutRecord';
import type { RepositoryRecord } from '../../private/records/types';
import { scanCheckoutState } from '../../private/scan/scanCheckoutState';
import type { Checkout } from '../../private/store/createCheckout';
import { createCheckout } from '../../private/store/createCheckout';
import { createCheckoutLocation } from '../../private/store/createCheckoutLocation';

import { cloneIfMissing } from './private/cloneIfMissing';

export async function cloneSpecific(
	ctx: WorkspaceContext,
	repos: RepositoryRecord[],
	repoName: string,
	checkoutInput?: string,
): Promise<void> {
	const canonical = repoName.startsWith('@') ? repoName.split('/')[1] : repoName;
	const repo = repos.find(r => r.name.toLowerCase() === canonical.toLowerCase());

	if (!repo) {
		ctx.log.log(createCloneFailure(undefined, `unknown repo "${repoName}"`));
		presentOperationsReport(ctx.log);
		return;
	}

	const location = createCheckoutLocation(repo, checkoutInput);

	const existing = ctx.store.getCheckoutForLocation(location);
	if (existing && existing.repo?.name !== repo.name) {
		const msg = `location ${location} is already used by checkout '${existing.record.name}'.`;
		ctx.log.log(createCloneFailure(existing, msg));
		presentOperationsReport(ctx.log);
		return;
	}

	let processedCheckout: Checkout;

	if (!existing) {
		const checkoutName = checkoutInput ? `${repo.name} @ ${checkoutInput}` : repo.name;
		const created = createCheckout(ctx.config, location, repo, 'main', checkoutName);

		ctx.store.addCheckout(created);
		await saveCheckoutRecord(ctx.config, created.record.name, created.record);

		await cloneIfMissing(ctx, created);
		processedCheckout = await scanCheckoutState(ctx, created);
	} else {
		await cloneIfMissing(ctx, existing);
		processedCheckout = await scanCheckoutState(ctx, existing);
	}

	presentCheckoutReport(ctx, [processedCheckout]);
	presentOperationsReport(ctx.log);
}
