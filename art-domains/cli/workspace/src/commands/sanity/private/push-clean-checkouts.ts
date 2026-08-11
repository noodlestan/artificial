import type { WorkspaceContext } from '../../../shared/workspace-context';

import { pushCheckout } from './push-checkout';
import { shouldPushCheckout } from './should-push-checkout';

export async function pushCleanCheckouts(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		if (!shouldPushCheckout(checkout)) continue;
		await pushCheckout(ctx, checkout);
	}
}
