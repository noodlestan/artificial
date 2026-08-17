import type { Checkout } from '../../../private/store/types';

import { doesIssueBlockPush } from './doesIssueBlockPush';

export function shouldPushCheckout(checkout: Checkout): boolean {
	if (!checkout.scan?.exists) return false;
	if (checkout.scan.issues.some(doesIssueBlockPush)) return false;
	if (checkout.scan.unpushed === 0) return false;
	return true;
}
