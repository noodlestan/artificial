import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentExtraneousReport } from '../../private/present/presentExtraneousReport';
import { scanAllCheckoutsStates } from '../../private/scan/scanAllCheckoutsStates';
import { scanExtraneousCheckouts } from '../../private/scan/scanExtraneousCheckouts';

export async function cloneStatus(ctx: WorkspaceContext): Promise<void> {
	await scanAllCheckoutsStates(ctx);
	await scanExtraneousCheckouts(ctx);
	presentCheckoutReport(ctx);
	presentExtraneousReport(ctx.store);
}
