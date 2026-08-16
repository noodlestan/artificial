import type { WorkspaceContext } from '../context/createWorkspaceContext';

import { scanCheckoutState } from './scanCheckoutState';

export async function scanAllCheckoutsStates(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		const updated = await scanCheckoutState(checkout);
		ctx.store.updateCheckout(updated);
	}
}
