import type { WorkspaceContext } from '../../private/context/workspace-context';
import { presentCheckoutReport } from '../../private/present/present-checkout-report';
import { presentExtraneousReport } from '../../private/present/present-extraneous-report';
import { scanAllCheckoutsStates } from '../../shared/scan-all-checkouts-states';
import { scanExtraneousCheckouts } from '../../shared/scanExtraneousCheckouts';

export async function cloneStatus(ctx: WorkspaceContext): Promise<void> {
	await scanAllCheckoutsStates(ctx);
	await scanExtraneousCheckouts(ctx);
	presentCheckoutReport(ctx);
	presentExtraneousReport(ctx.store);
}
