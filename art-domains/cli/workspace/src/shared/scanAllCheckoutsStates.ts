import type { WorkspaceContext } from '../private/context/createWorkspaceContext';

import { scanCheckoutState } from './scanCheckoutState';

export async function scanAllCheckoutsStates(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		await scanCheckoutState(ctx, checkout);
	}
}
