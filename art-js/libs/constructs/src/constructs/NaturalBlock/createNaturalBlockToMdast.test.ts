import { describe, expect, it } from 'vitest';

import { createNaturalBlockToMdast } from './createNaturalBlockToMdast';

describe('createNaturalBlockToMdast', () => {
	it('parses a text value into a root with paragraph', () => {
		const impl = createNaturalBlockToMdast();
		const result = impl.toMdast(
			{ construct: 'NaturalBlock', type: 'text', value: ' Hello world' } as never,
			[],
		);
		expect(result).toMatchObject({
			type: 'root',
			children: expect.arrayContaining([expect.objectContaining({ type: 'paragraph' })]),
		});
	});

	it('parses a code block value', () => {
		const impl = createNaturalBlockToMdast();
		const result = impl.toMdast(
			{
				construct: 'NaturalBlock',
				type: 'code',
				lang: null,
				meta: null,
				value: '```\nconst x = 1;\n```',
			} as never,
			[],
		);
		expect(result).toMatchObject({
			type: 'root',
			children: expect.arrayContaining([expect.objectContaining({ type: 'code' })]),
		});
	});
});
