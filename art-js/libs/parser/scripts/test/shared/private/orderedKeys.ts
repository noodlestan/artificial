export const FIELD_ORDER = [
	'construct',
	'type',
	'kind',
	'name',
	'attributes',
	'...',
	'value',
	'position',
	'children',
];

export function orderedKeys(keys: string[]): string[] {
	const remaining = new Set(keys);
	const result: string[] = [];
	const ellipsisIdx = FIELD_ORDER.indexOf('...');
	const afterEllipsis = new Set(FIELD_ORDER.slice(ellipsisIdx + 1));

	for (const field of FIELD_ORDER) {
		if (field === '...') {
			const rest = [...remaining].filter(k => !afterEllipsis.has(k)).sort();
			for (const k of rest) {
				result.push(k);
				remaining.delete(k);
			}
			continue;
		}
		if (remaining.has(field)) {
			result.push(field);
			remaining.delete(field);
		}
	}

	for (const k of [...remaining].sort()) {
		result.push(k);
	}

	return result;
}
