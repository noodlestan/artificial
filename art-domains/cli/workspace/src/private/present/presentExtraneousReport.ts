import type { Checkout } from '../store/types';

import { formatTable } from './formatTable';

export function presentExtraneousReport(extraneous: Checkout[]): void {
	if (extraneous.length === 0) {
		return;
	}

	const headers = ['directory', 'branch', 'states'];
	const rows = extraneous.map(c => [
		c.record.location,
		c.scan?.branch || c.record.branch,
		c.scan?.issues.join('; ') || 'clean',
	]);

	console.info('Untracked:');
	console.info(formatTable(rows, headers));
	console.info('');
}
