import type { CheckoutStateNoDetached } from '../types';

export const createNoDetachedState = (attached: boolean): CheckoutStateNoDetached => ({
	type: 'no-detached',
	attached,
});
