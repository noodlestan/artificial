import { scanAllCheckouts, scanExtraneousCheckouts } from '../../shared/scan-checkout';
import type { WorkspaceContext } from '../../shared/workspace-context';

import { presentCheckoutReport, presentExtraneousReport } from './private/present';

export async function cloneStatus(ctx: WorkspaceContext): Promise<void> {
	ctx.store.loadExistingCheckouts();
	await scanAllCheckouts(ctx);
	await scanExtraneousCheckouts(ctx);
	presentCheckoutReport(ctx.store);
	presentExtraneousReport(ctx.store);
}
