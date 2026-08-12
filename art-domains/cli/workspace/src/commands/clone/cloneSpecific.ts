import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { createCloneFailure } from '../../private/operations/createCloneFailure';
import { saveCheckoutRecord } from '../../private/records/saveCheckoutRecord';
import type { RepositoryRecord } from '../../private/records/types';
import { createCheckout } from '../../private/store/create-checkout';
import { createCheckoutLocation } from '../../private/store/createCheckoutLocation';
import { scanCheckoutState } from '../../shared/scanCheckoutState';

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
		return;
	}

	const location = createCheckoutLocation(repo, checkoutInput);
	const checkout = ctx.store.getCheckoutForLocation(location);
	if (checkout && checkout.record.location !== location) {
		const msg = `checkout for '${repo.name}' exists at ${checkout.record.location}. Cannot clone to ${location}.`;
		ctx.log.log(createCloneFailure(checkout, msg));
		return;
	}
	if (!checkout) {
		const allCheckouts = ctx.store.getAllCheckouts();
		const conflicting = allCheckouts.find(c => c.record.location === location);
		if (conflicting) {
			const msg = `location ${location} is already used by checkout '${conflicting.record.name}'.`;
			ctx.log.log(createCloneFailure(conflicting, msg));
			return;
		}

		const checkoutName = checkoutInput ? `${repo.name} @ ${checkoutInput}` : repo.name;
		const checkout = createCheckout(ctx.config, location, repo, 'main', checkoutName);

		ctx.store.addCheckout(checkout);
		await saveCheckoutRecord(ctx.config, checkout.record.name, checkout.record);

		await cloneIfMissing(ctx, checkout);
		await scanCheckoutState(ctx, checkout);
	} else {
		await cloneIfMissing(ctx, checkout);
		await scanCheckoutState(ctx, checkout);
	}
}
