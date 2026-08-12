import { join } from 'node:path';

import { WorkspaceContext } from '../context/createWorkspaceContext';

import { formatTable } from './format-table';

export function presentCheckoutReport(ctx: WorkspaceContext): void {
	const checkouts = ctx.store.getAllCheckouts();
	checkouts.sort((a, b) => {
		if (a.repo?.remote === '' && b.repo?.remote !== '') return 1;
		if (a.repo?.remote !== '' && b.repo?.remote === '') return -1;
		return a.repo?.name.localeCompare(b.repo?.name || '') || -1;
	});

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = checkouts.map(c => [
		c.repo?.name || '-',
		join(ctx.config.clone.path, c.record.location),
		c.record.branch,
		c.issues.join('; ') || '-',
	]);

	console.info('Checkouts:');
	console.info(formatTable(rows, headers));
	console.info('');
}
