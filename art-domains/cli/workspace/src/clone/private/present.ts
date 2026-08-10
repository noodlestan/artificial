import type { CheckoutStore } from '../../shared/checkout-store';
import type { OperationsLog } from '../../shared/operations-log';

function formatTable(rows: string[][], headers: string[]): string {
	const allRows = [headers, ...rows];
	const colWidths = headers.map((_, colIdx) =>
		Math.max(...allRows.map(row => String(row[colIdx]).length)),
	);

	const lines = allRows.map(row =>
		row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('  '),
	);

	return lines.join('\n');
}

export function presentCheckoutReport(store: CheckoutStore): void {
	const checkouts = store.getAllCheckouts();
	checkouts.sort((a, b) => a.repo.name.localeCompare(b.repo.name));

	const headers = ['repo', 'location', 'branch', 'states'];
	const rows = checkouts.map(c => [
		c.repo.name,
		c.record.location,
		c.branch,
		c.issues.join('; ') || 'clean',
	]);

	console.info('Checkout Report:');
	console.info(formatTable(rows, headers));
	console.info('');
}

export function presentOperationsReport(log: OperationsLog): void {
	const operations = log.all();
	if (operations.length === 0) {
		return;
	}

	const headers = ['repo', 'operation', 'detail'];
	const rows = operations.map(op => [op.repo, op.operation, op.detail]);

	console.info('Operations Report:');
	console.info(formatTable(rows, headers));
	console.info('');
}

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

	console.info('Extraneous Report:');
	console.info(formatTable(rows, headers));
	console.info('');
}
