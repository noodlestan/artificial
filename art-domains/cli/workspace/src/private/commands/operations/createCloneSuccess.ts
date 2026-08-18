import type { CloneSuccess } from '../../operations/types';
import type { Checkout } from '../../store/createCheckout';

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
