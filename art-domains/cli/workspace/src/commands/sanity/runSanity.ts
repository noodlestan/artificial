import { pullWorkspaceCheckout } from '../../private/commands/workspaces/pullWorkspaceCheckout';
import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentExtraneousReport } from '../../private/present/presentExtraneousReport';
import { presentOperationsReport } from '../../private/present/presentOperationsReport';
import { presentWorkspaceReport } from '../../private/present/presentWorkspaceReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { scanCheckoutState } from '../../private/scan/scanCheckoutState';
import { createCheckout } from '../../private/store/createCheckout';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

import { pushCleanCheckouts } from './private/pushCleanCheckouts';
import { scanExtraneousCheckouts } from './private/scanExtraneousCheckouts';

export async function runSanity(ctx: WorkspaceContext, options: { auto: boolean }): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);

	const workspaceCheckout = {
		...createCheckout(ctx.config, '.', undefined, 'main', 'Workspace'),
		path: ctx.config.root.path,
	};
	const workspace = await scanCheckoutState(workspaceCheckout);
	ctx.workspace = workspace;

	await scanAllCheckoutsStates(ctx.store);
	if (options.auto) {
		await pullWorkspaceCheckout(ctx);
		await pushCleanCheckouts(ctx);
	}

	const extraneous = await scanExtraneousCheckouts(ctx.config);

	presentWorkspaceReport(ctx.workspace);
	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	presentExtraneousReport(extraneous);
	presentOperationsReport(ctx.log);
}
