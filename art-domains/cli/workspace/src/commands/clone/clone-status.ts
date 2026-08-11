import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentExtraneousReport } from '../../private/present/present-extraneous-report';
import { scanAllCheckouts, scanExtraneousCheckouts } from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';

export async function cloneStatus(ctx: WorkspaceContext): Promise<void> {
	ctx.store.loadExistingCheckouts();
	await scanAllCheckouts(ctx);
	await scanExtraneousCheckouts(ctx);
	presentCheckoutReport(ctx.store);
	presentExtraneousReport(ctx.store);
}
