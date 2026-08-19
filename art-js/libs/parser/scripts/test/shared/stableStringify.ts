import { orderedKeys } from './private/orderedKeys';

export const FIELD_ORDER = [
	'construct',
	'type',
	'kind',
	'name',
	'...',
	'value',
	'position',
	'children',

	'construct',
	'type',
	'kind',
	'name',
	'...',
	'value',
	'position',
	'children',
];

export function stableStringify(obj: unknown, indent = 0): string {
	const pad = '  '.repeat(indent);
	const inner = '  '.repeat(indent + 1);
	if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
	if (Array.isArray(obj)) {
		if (obj.length === 0) return '[]';
		const items = obj.map(v => inner + stableStringify(v, indent + 1));
		return '[\n' + items.join(',\n') + '\n' + pad + ']';
	}
	const keys = orderedKeys(Object.keys(obj as Record<string, unknown>));
	if (keys.length === 0) return '{}';
	const entries = keys.map(
		k =>
			inner +
			JSON.stringify(k) +
			': ' +
			stableStringify((obj as Record<string, unknown>)[k], indent + 1),
	);
	return '{\n' + entries.join(',\n') + '\n' + pad + '}';
}
