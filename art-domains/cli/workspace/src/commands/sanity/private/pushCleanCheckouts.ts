import { doPushCheckout } from '../../../private/commands/checkouts/doPushCheckout';
import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';

export async function pushCleanCheckouts(ctx: WorkspaceContext): Promise<void> {
	for (const checkout of ctx.store.getAllCheckouts()) {
		if (!checkout.scan?.can?.('push') || !checkout.scan.should?.('push')) continue;
		await doPushCheckout(ctx, checkout);
	}
}
