import type { Checkout } from '../store/createCheckout';

import { formatTable } from './formatTable';

export function presentWorkspaceReport(workspace?: Checkout): void {
	if (!workspace) {
		return;
	}

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = [
		[workspace.repo?.name || '-', '.', workspace.record.branch, workspace.issues.join('; ') || '-'],
	];

	console.info('Workspace:');
	console.info(formatTable(rows, headers));
	console.info('');
}
