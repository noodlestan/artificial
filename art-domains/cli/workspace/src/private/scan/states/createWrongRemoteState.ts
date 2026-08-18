import type { CheckoutStateWrongRemote } from '../types';

export const createWrongRemoteState = (wrong: boolean): CheckoutStateWrongRemote => ({
	type: 'wrong-remote',
	wrong,
});
