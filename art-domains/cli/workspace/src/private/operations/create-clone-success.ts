import type { Checkout } from '../store/create-checkout';

import type { CloneSuccess } from './types';

export function createCloneSuccess(checkout: Checkout): CloneSuccess {
	return {
		ts: new Date(),
		checkout,
		outcome: 'success',
		operation: 'clone',
		location: checkout.record.location,
		message() {
			return `to ${checkout.record.location}`;
		},
	};
}
