import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { scanAllCheckoutsStates } from '../../private/scan/scanAllCheckoutsStates';

export async function cloneStatus(ctx: WorkspaceContext): Promise<void> {
	await scanAllCheckoutsStates(ctx);
	presentCheckoutReport(ctx);
}
