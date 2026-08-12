import type { Checkout } from '../../../private/store/create-checkout';

import { doesIssueBlockPush } from './does-issue-block-push';

export function shouldPushCheckout(checkout: Checkout): boolean {
	if (!checkout.exists) return false;
	if (checkout.extraneous) return false;
	if (checkout.issues.some(doesIssueBlockPush)) return false;
	if (checkout.unpushed === 0) return false;
	return true;
}
