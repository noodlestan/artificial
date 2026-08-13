import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { createCloneFailure } from '../../private/operations/createCloneFailure';
import { saveCheckoutRecord } from '../../private/records/saveCheckoutRecord';
import type { RepositoryRecord } from '../../private/records/types';
import { createCheckout } from '../../private/store/createCheckout';
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

	const existing = ctx.store.getCheckoutForLocation(location);
	if (existing && existing.repo?.name !== repo.name) {
		const msg = `location ${location} is already used by checkout '${existing.record.name}'.`;
		ctx.log.log(createCloneFailure(existing, msg));
		return;
	}

	if (!existing) {
		const checkoutName = checkoutInput ? `${repo.name} @ ${checkoutInput}` : repo.name;
		const created = createCheckout(ctx.config, location, repo, 'main', checkoutName);

		ctx.store.addCheckout(created);
		await saveCheckoutRecord(ctx.config, created.record.name, created.record);

		await cloneIfMissing(ctx, created);
		await scanCheckoutState(ctx, created);
		return;
	}

	await cloneIfMissing(ctx, existing);
	await scanCheckoutState(ctx, existing);
}
