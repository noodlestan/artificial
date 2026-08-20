import type { Text } from 'mdast';
import { describe, expect, it } from 'vitest';

import { createFieldBlockToMdast } from './createFieldBlockToMdast';

describe('createFieldBlockToMdast', () => {
	it('converts a FieldBlock to a label paragraph', () => {
		const impl = createFieldBlockToMdast();
		const value: Text = { type: 'text', value: ' Generate and manage agent instructions.' };
		const result = impl.toMdast({ construct: 'FieldBlock', name: 'Purpose' } as never, [value]);
		expect(result).toEqual({
			type: 'paragraph',
			children: [{ type: 'strong', children: [{ type: 'text', value: 'Purpose:' }] }],
		});
	});
});
