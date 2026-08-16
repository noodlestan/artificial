import simpleGit from 'simple-git';

import type { Checkout } from '../store/createCheckout';

export interface PullResult {
	checkout: Checkout;
	success: boolean;
	error?: unknown;
}

export async function pullCheckout(checkout: Checkout): Promise<PullResult> {
	const git = simpleGit(checkout.path);
	try {
		await git.pull('origin', checkout.record.branch);
		const updated: Checkout = {
			...checkout,
			isBehind: false,
			issues: checkout.issues.filter(i => !/\d+ commit behind/.test(i)),
		};
		return { checkout: updated, success: true };
	} catch (error) {
		return { checkout, success: false, error };
	}
}
