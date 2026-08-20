import { orderedKeys } from './private/orderedKeys';

export function stableStringify(value: unknown, indent = 0): string {
	const pad = '  '.repeat(indent);
	const inner = '  '.repeat(indent + 1);
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const items = value.map(v => inner + stableStringify(v, indent + 1));
		return '[\n' + items.join(',\n') + '\n' + pad + ']';
	}
	const obj = value as Record<string, unknown>;
	const keys = orderedKeys(Object.keys(obj));
	if (keys.length === 0) return '{}';
	const entries = keys
		.filter(k => obj[k] !== undefined)
		.map(k => inner + JSON.stringify(k) + ': ' + stableStringify(obj[k], indent + 1));
	return '{\n' + entries.join(',\n') + '\n' + pad + '}';
}
