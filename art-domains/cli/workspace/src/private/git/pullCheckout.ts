import simpleGit from 'simple-git';

import type { Checkout } from '../store/createCheckout';

export async function pullCheckout(checkout: Checkout): Promise<Checkout> {
	const git = simpleGit(checkout.path);
	await git.pull('origin', checkout.record.branch);
	return {
		...checkout,
		isBehind: false,
		issues: checkout.issues.filter(i => !/\d+ commit behind/.test(i)),
	};
}
