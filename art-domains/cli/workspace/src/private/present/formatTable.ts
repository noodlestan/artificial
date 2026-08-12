export function formatTable(rows: string[][], headers: string[]): string {
	const allRows = [headers, ...rows];
	const colWidths = headers.map((_, colIdx) =>
		Math.max(...allRows.map(row => String(row[colIdx]).length)),
	);

	const lines = allRows.map(row =>
		row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('  '),
	);

	return lines.join('\n');
}
