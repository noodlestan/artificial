import type { Checkout } from '../store/types';

export function isCleanCheckout(checkout: Checkout): boolean {
	if (!checkout.scan?.exists) return false;
	if (checkout.scan.dirty) return false;
	if (checkout.scan.conflicts) return false;
	if (checkout.scan.detached) return false;
	return true;
}
