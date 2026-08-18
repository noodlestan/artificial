import type { PullSuccess } from '../../operations/types';
import type { Checkout } from '../../store/createCheckout';

export function createPullSuccess(checkout: Checkout, branch: string): PullSuccess {
	return {
		ts: new Date(),
		checkout,
		outcome: 'success',
		operation: 'pull',
		branch,
		message() {
			return `from origin/${branch}`;
		},
	};
}
