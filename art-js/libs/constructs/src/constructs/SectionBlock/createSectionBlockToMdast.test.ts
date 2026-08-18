import { describe, expect, it } from 'vitest';

import { createSectionBlockToMdast } from './createSectionBlockToMdast';

describe('createSectionBlockToMdast', () => {
	it('converts a SectionBlock to an mdast heading', () => {
		const impl = createSectionBlockToMdast();
		const result = impl.toMdast(
			{ construct: 'SectionBlock', name: 'Module', depth: 1 } as never,
			[],
		);
		expect(result).toEqual({
			type: 'heading',
			depth: 1,
			children: [{ type: 'text', value: 'Module' }],
		});
	});

	it('defaults depth to 1 when not provided', () => {
		const impl = createSectionBlockToMdast();
		const result = impl.toMdast({ construct: 'SectionBlock', name: 'Section' } as never, []);
		expect(result).toEqual({
			type: 'heading',
			depth: 1,
			children: [{ type: 'text', value: 'Section' }],
		});
	});
});
