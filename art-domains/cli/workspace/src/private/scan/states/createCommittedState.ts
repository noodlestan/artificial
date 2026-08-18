import type { CheckoutStateCommitted } from '../types';

export const createCommittedState = (clean: boolean): CheckoutStateCommitted => ({
	type: 'committed',
	clean,
});
