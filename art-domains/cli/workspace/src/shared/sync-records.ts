import type { CheckoutStore } from './checkout-store';

export function syncRecords(store: CheckoutStore): void {
	store.syncRecords();
}
