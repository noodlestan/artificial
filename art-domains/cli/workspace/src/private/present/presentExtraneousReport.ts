import type { CheckoutStore } from '../store/createCheckoutStore';

import { formatTable } from './format-table';

export function presentExtraneousReport(store: CheckoutStore): void {
	const extraneous = store.getExtraneous();
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
