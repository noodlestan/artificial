import type { CheckoutStateSync } from '../types';

export const createSyncState = (
	delta: number,
	ahead = Math.max(delta, 0),
	behind = Math.max(-delta, 0),
): CheckoutStateSync => ({
	type: 'sync',
	delta,
	ahead,
	behind,
});
