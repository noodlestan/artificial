import type { Checkout } from '../store/create-checkout';

import type { PushSuccess } from './types';

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
