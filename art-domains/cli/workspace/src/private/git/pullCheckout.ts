import simpleGit from 'simple-git';

import { scanCheckoutState } from '../scan/scanCheckoutState';
import type { Checkout } from '../store/types';

export async function pullCheckout(checkout: Checkout): Promise<Checkout> {
	const git = simpleGit(checkout.path);
	await git.pull('origin', checkout.record.branch);
	return scanCheckoutState(checkout);
}
