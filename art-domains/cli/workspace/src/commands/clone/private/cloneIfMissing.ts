import { doClone } from '../../../private/commands/doClone';
import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';
import { scanCheckoutState } from '../../../private/scan/scanCheckoutState';
import type { Checkout } from '../../../private/store/createCheckout';

export async function cloneIfMissing(
	ctx: WorkspaceContext,
	checkout: Checkout,
): Promise<Checkout | null> {
	const scanned = await scanCheckoutState(checkout);
	if (!scanned.scan?.should?.('clone')) {
		return scanned;
	}

	if (!scanned.repo) {
		return null;
	}

	return doClone(ctx, scanned);
}
