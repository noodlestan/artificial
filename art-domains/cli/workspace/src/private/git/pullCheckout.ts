import simpleGit from 'simple-git';

import type { Checkout } from '../store/types';

export async function pullCheckout(checkout: Checkout): Promise<Checkout> {
	const git = simpleGit(checkout.path);
	await git.pull('origin', checkout.record.branch);
	return {
		...checkout,
		scan: checkout.scan && {
			...checkout.scan,
			isBehind: false,
			issues: checkout.scan.issues.filter(i => !/\d+ commit behind/.test(i)),
		},
	};
}
