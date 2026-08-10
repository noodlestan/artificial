import type { CheckoutStore, CheckoutStatus } from './checkout-store';

function formatTable(checkouts: CheckoutStatus[]): string {
	const headers = ['repo/directory', 'branch', 'issues', 'pushed?'];
	const data = checkouts.map(c => [
		c.extraneous ? `${c.location} (extraneous)` : c.location,
		c.branch,
		c.issues.join('; ') || 'clean',
		c.pushed,
	]);

	const allRows = [headers, ...data];
	const colWidths = headers.map((_, colIdx) =>
		Math.max(...allRows.map(row => String(row[colIdx]).length)),
	);

	const lines = allRows.map(row =>
		row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('  '),
	);

	return lines.join('\n');
}

export function presentCheckoutStatus(store: CheckoutStore): void {
	const checkouts = store.getAllCheckouts();

	// Sort by package name
	checkouts.sort((a, b) => a.name.localeCompare(b.name));

	// Filter to non-green checkouts
	const nonGreen = checkouts.filter(c => {
		if (!c.exists) return true;
		if (c.issues.length > 0) return true;
		if (c.pushed !== 'yes' && c.pushed !== 'now') return true;
		return false;
	});

	if (nonGreen.length === 0) {
		console.info('All repos are green ✓');
	} else {
		console.info(formatTable(nonGreen));
	}
}
