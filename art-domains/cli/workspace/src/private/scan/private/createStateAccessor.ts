import type { CheckoutScan, CheckoutState, CheckoutStateOf, CheckoutStateType } from '../types';

export function createStateAccessor(states: CheckoutState[]): CheckoutScan['state'] {
	return <T extends CheckoutStateType>(type: T): CheckoutStateOf<T> => {
		const state = states.find(item => item.type === type);
		if (!state) throw new Error(`missing checkout state: ${type}`);
		return state as CheckoutStateOf<T>;
	};
}
