import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentExtraneousReport } from '../../private/present/present-extraneous-report';
import { presentOperationsReport } from '../../private/present/present-operations-report';
import {
	scanAllCheckouts,
	scanCheckout,
	scanExtraneousCheckouts,
} from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';

import { pushCleanCheckouts } from './private/push-clean-checkouts';

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
		await pushCleanCheckouts(ctx);
	}

	presentCheckoutReport(ctx.store);
	presentExtraneousReport(ctx.store);
	presentOperationsReport(ctx.log);

	if (auto) {
		ctx.store.syncRecords();
	}
}
