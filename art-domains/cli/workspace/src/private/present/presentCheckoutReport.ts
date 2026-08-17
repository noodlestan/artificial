import { join } from 'node:path';

import type { WorkspaceConfig } from '../../config/types';
import type { Checkout } from '../store/types';

import { formatTable } from './formatTable';

export function presentCheckoutReport(config: WorkspaceConfig, checkouts: Checkout[]): void {
	const items = [...checkouts];
	items.sort((a, b) => {
		if (a.repo?.remote === '' && b.repo?.remote !== '') return 1;
		if (a.repo?.remote !== '' && b.repo?.remote === '') return -1;
		return a.repo?.name.localeCompare(b.repo?.name || '') || -1;
	});

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = items.map(c => [
		c.repo?.name || '-',
		join(config.clone.path, c.record.location),
		c.scan?.branch || c.record.branch,
		c.scan?.issues.join('; ') || '-',
	]);

	console.info('Checkouts:');
	console.info(formatTable(rows, headers));
	console.info('');
}
