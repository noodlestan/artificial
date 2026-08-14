import type { WorkspaceContext } from '../context/createWorkspaceContext';

import { formatTable } from './formatTable';

export function presentWorkspaceReport(ctx: WorkspaceContext): void {
	if (!ctx.workspace) {
		return;
	}

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = [
		[
			ctx.workspace.repo?.name || '-',
			'.',
			ctx.workspace.record.branch,
			ctx.workspace.issues.join('; ') || '-',
		],
	];

	console.info('Workspace:');
	console.info(formatTable(rows, headers));
	console.info('');
}
