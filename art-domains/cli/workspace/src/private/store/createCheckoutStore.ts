import { WorkspaceConfig } from '../../config';

import { type Checkout, createCheckout } from './create-checkout';

export interface CheckoutStore {
	addCheckout: (checkout: Checkout) => void;
	getCheckoutForLocation: (location: string) => Checkout | undefined;
	getCheckoutOfRepo: (name: string) => Checkout | undefined;
	getCheckoutByName: (name: string) => Checkout | undefined;
	updateCheckout: (checkout: Checkout) => void;
	getAllCheckouts: () => Checkout[];
	markExtraneous: (config: WorkspaceConfig, location: string) => Checkout;
	getExtraneous: () => Checkout[];
}

export function createCheckoutStore(): CheckoutStore {
	const checkouts = new Map<string, Checkout>();

	function addCheckout(checkout: Checkout) {
		const existing = checkouts.get(checkout.record.location);
		if (existing) {
			const msg = `Duplicate location: "${checkout.record.location}", existing: "${existing.record.name}" duplicate: "${checkout.record.name}".`;
			console.error(msg);
		} else {
			checkouts.set(checkout.record.location, checkout);
		}
	}

	return {
		addCheckout,

		getCheckoutForLocation(location: string): Checkout | undefined {
			return checkouts.get(location);
		},

		getCheckoutOfRepo(name: string): Checkout | undefined {
			const n = name.toLowerCase();
			return Array.from(checkouts.values()).find(
				checkout => checkout.repo?.name.toLowerCase() === n,
			);
		},

		getCheckoutByName(name: string): Checkout | undefined {
			const n = name.toLowerCase();
			return Array.from(checkouts.values()).find(
				checkout => checkout.record.name.toLowerCase() === n,
			);
		},

		updateCheckout(checkout: Checkout): void {
			checkouts.set(checkout.record.location, checkout);
		},

		getAllCheckouts(): Checkout[] {
			return Array.from(checkouts.values());
		},

		markExtraneous(config: WorkspaceConfig, location: string): Checkout {
			const original = checkouts.get(location);
			const checkout: Checkout = original ? { ...original } : createCheckout(config, location);
			checkout.extraneous = true;
			checkouts.set(checkout.record.location, checkout);
			return checkout;
		},

		getExtraneous(): Checkout[] {
			return Array.from(checkouts.values()).filter(c => c.extraneous);
		},
	};
}
