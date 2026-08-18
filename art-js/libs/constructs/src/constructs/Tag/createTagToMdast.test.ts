import { describe, expect, it } from 'vitest';

import { createTagToMdast } from './createTagToMdast';

describe('createTagToMdast', () => {
	it('converts a Tag to a text node with @ prefix', () => {
		const impl = createTagToMdast();
		const result = impl.toMdast({ construct: 'Tag', name: 'READ' } as never, []);
		expect(result).toEqual({
			type: 'text',
			value: '@READ',
		});
	});
});
