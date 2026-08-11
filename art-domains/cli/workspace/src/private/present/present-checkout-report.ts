import type { CheckoutStore } from '../../shared/checkout-store';

import { formatTable } from './format-table';

export function presentCheckoutReport(store: CheckoutStore): void {
	const checkouts = store.getAllCheckouts();
	checkouts.sort((a, b) => {
		if (a.repo.remote === '' && b.repo.remote !== '') return 1;
		if (a.repo.remote !== '' && b.repo.remote === '') return -1;
		return a.repo.name.localeCompare(b.repo.name);
	});

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = checkouts.map(c => [
		c.repo.remote === '' ? '' : c.repo.name,
		c.record.location,
		c.branch,
		c.issues.join('; ') || 'clean',
	]);

	console.info('Checkout Report:');
	console.info(formatTable(rows, headers));
	console.info('');
}
