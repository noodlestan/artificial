import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createCloneFailure } from '../../private/commands/operations/createCloneFailure';
import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { saveCheckoutRecord } from '../../private/resources/checkout/saveCheckoutRecord';
import type { RepositoryRecord } from '../../private/resources/types';
import { createCheckout } from '../../private/store/createCheckout';
import { createCheckoutLocation } from '../../private/store/createCheckoutLocation';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

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

	if (existing) {
		await cloneIfMissing(ctx, existing);
	} else {
		const targetDir = join(ctx.config.root.path, ctx.config.clone.path, location);
		if (existsSync(targetDir)) {
			const msg = `directory already exists at ${targetDir}`;
			ctx.log.log(createCloneFailure(undefined, msg));
			presentOperationsReport(ctx.log);
			return;
		}

		const checkoutName = checkoutInput ? `${repo.name} @ ${checkoutInput}` : repo.name;
		const created = createCheckout(ctx.config, location, repo, 'main', checkoutName);

		ctx.store.addCheckout(created);
		await saveCheckoutRecord(ctx.config, created.record);

		await cloneIfMissing(ctx, created);
	}

	await scanAllCheckoutsStates(ctx.store);
	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentOperationsReport(ctx.log);
}
