import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';

import { pushCheckout } from './pushCheckout';
import { shouldPushCheckout } from './shouldPushCheckout';

export async function pushCleanCheckouts(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		if (!shouldPushCheckout(checkout)) continue;
		await pushCheckout(ctx, checkout);
	}
}
