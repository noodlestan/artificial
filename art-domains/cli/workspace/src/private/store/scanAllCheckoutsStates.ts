import { scanCheckoutState } from '../scan/scanCheckoutState';

import type { CheckoutStore } from './createCheckoutStore';

export async function scanAllCheckoutsStates(store: CheckoutStore): Promise<void> {
	for (const checkout of store.getAllCheckouts()) {
		const updated = await scanCheckoutState(checkout);
		store.updateCheckout(updated);
	}
}
