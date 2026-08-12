import type { WorkspaceContext } from '../private/context/workspace-context';

import { scanCheckoutState } from './scan-checkout-state';

export async function scanAllCheckoutsStates(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		await scanCheckoutState(ctx, checkout);
	}
}
