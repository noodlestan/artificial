import type { Checkout } from '../store/createCheckout';

export function isCleanCheckout(checkout: Checkout): boolean {
	if (!checkout.exists) return false;
	if (checkout.extraneous) return false;
	if (checkout.dirty) return false;
	if (checkout.conflicts) return false;
	if (checkout.detached) return false;
	return true;
}
