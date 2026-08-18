import type { CheckoutStateExists } from '../types';

export const createExistsState = (exists: boolean): CheckoutStateExists => ({
	type: 'exists',
	exists,
});
