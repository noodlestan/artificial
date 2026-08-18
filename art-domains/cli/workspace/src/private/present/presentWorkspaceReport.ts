import type { Checkout } from '../store/types';

import { formatTable } from './formatTable';

export function presentWorkspaceReport(workspace?: Checkout): void {
	if (!workspace) {
		return;
	}

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = [
		[
			workspace.repo?.name || '-',
			'.',
			workspace.scan?.state('remote').branch || workspace.record.branch,
			workspace.scan?.issues().join('; ') || '-',
		],
	];

	console.info('Workspace:');
	console.info(formatTable(rows, headers));
	console.info('');
}
