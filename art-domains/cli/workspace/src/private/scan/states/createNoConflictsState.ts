import type { CheckoutStateNoConflicts } from '../types';

export const createNoConflictsState = (clear: boolean): CheckoutStateNoConflicts => ({
	type: 'no-conflicts',
	clear,
});
