import { describe, expect, it } from 'vitest';

import { formatTable } from './formatTable';

describe('formatTable', () => {
	it('pads columns so headers and rows are aligned', () => {
		const headers = ['Name', 'Value'];
		const rows = [
			['abc', '12'],
			['x', '12345'],
		];

		const output = formatTable(rows, headers);
		const lines = output.split('\n');

		expect(lines[0]).toBe('Name  Value');
		expect(lines[1]).toBe('abc   12   ');
		expect(lines[2]).toBe('x     12345');
	});
});
