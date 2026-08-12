import type { Checkout } from '../store/createCheckout';

import type { BranchSuccess } from './types';

export function createBranchSuccess(
	checkout: Checkout,
	branch: string,
	message?: string,
): BranchSuccess {
	return {
		ts: new Date(),
		checkout,
		outcome: 'success',
		operation: 'branch created',
		branch,
		message() {
			return message || '<empty>';
		},
	};
}
