import type { OperationsLog } from '../log/createOperationsLog';

import { formatTable } from './formatTable';

export function presentOperationsReport(log: OperationsLog): void {
	const operations = log.all();
	if (operations.length === 0) {
		return;
	}

	const headers = ['', 'repo', 'operation', 'message'];
	const rows = operations.map(op => [
		op.outcome === 'success' ? '🟢' : '🔴',
		op.checkout?.repo?.name || 'unknown',
		op.operation,
		op.message(),
	]);

	console.info('Operations Report:');
	console.info(formatTable(rows, headers));
	console.info('');
}
