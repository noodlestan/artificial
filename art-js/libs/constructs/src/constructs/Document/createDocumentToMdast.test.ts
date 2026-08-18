import type { Heading, Text } from 'mdast';
import { describe, expect, it } from 'vitest';

import { createDocumentToMdast } from './createDocumentToMdast';

describe('createDocumentToMdast', () => {
	it('wraps children in a root node', () => {
		const impl = createDocumentToMdast();
		const heading: Heading = {
			type: 'heading',
			depth: 1,
			children: [{ type: 'text', value: 'Hello' } as Text],
		};
		const result = impl.toMdast({ construct: 'Document' } as never, [heading]);
		expect(result).toEqual({
			type: 'root',
			children: [heading],
		});
	});
});
