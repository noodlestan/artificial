import type { Checkout } from '../../../shared/checkout';

import { doesIssueBlockPush } from './does-issue-block-push';

export function shouldPushCheckout(checkout: Checkout): boolean {
	if (!checkout.exists) return false;
	if (checkout.extraneous) return false;
	if (checkout.issues.some(doesIssueBlockPush)) return false;
	if (checkout.unpushed === 0) return false;
	if (checkout.issues.some(i => i.includes('no remote'))) return false;
	return true;
}
