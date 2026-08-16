import type { Checkout } from '../store/createCheckout';

import { formatTable } from './formatTable';

export function presentExtraneousReport(extraneous: Checkout[]): void {
	if (extraneous.length === 0) {
		return;
	}

	const headers = ['directory', 'branch', 'states'];
	const rows = extraneous.map(c => [
		c.record.location,
		c.record.branch,
		c.issues.join('; ') || 'clean',
	]);

	console.info('Untracked:');
	console.info(formatTable(rows, headers));
	console.info('');
}
