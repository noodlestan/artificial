import type { PushSuccess } from '../../operations/types';
import type { Checkout } from '../../store/createCheckout';

export function createPushSuccess(checkout: Checkout, branch: string): PushSuccess {
	return {
		ts: new Date(),
		checkout,
		outcome: 'success',
		operation: 'push',
		branch,
		message() {
			return `to origin/${branch}`;
		},
	};
}
