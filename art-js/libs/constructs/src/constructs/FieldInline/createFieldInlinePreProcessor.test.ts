import { createNestedContext } from '@art-js/artificial-primitives';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { describe, expect, it } from 'vitest';

import { createFieldInlinePreProcessor } from './createFieldInlinePreProcessor';

describe('createFieldInlinePreProcessor', () => {
	it('captures inline field values from paragraph siblings after the label', () => {
		const impl = createFieldInlinePreProcessor();
		const markdown = '# Hello World\n\n**Greeting:** Hello world.';
		const tree = fromMarkdown(markdown);
		const paragraph = tree.children[1] as never;
		const context = createNestedContext('Document', undefined, markdown);

		expect(impl.preProcess(paragraph, context)).toMatchObject({
			construct: 'FieldInline',
			name: 'Greeting',
			value: [
				{
					construct: 'NaturalExpression',
					type: 'text',
					value: 'Hello world.',
				},
			],
			position: {
				start: { line: 3, column: 1, offset: 15 },
				end: { line: 3, column: 27, offset: 41 },
			},
		});
	});

	it('preserves inline child types in the field value', () => {
		const impl = createFieldInlinePreProcessor();
		const markdown = '# Hello World\n\n**Remote:** `git@example.com`';
		const tree = fromMarkdown(markdown);
		const paragraph = tree.children[1] as never;
		const context = createNestedContext('Document', undefined, markdown);

		expect(impl.preProcess(paragraph, context)).toMatchObject({
			construct: 'FieldInline',
			name: 'Remote',
			value: [
				{
					construct: 'NaturalExpression',
					type: 'inlineCode',
					value: 'git@example.com',
				},
			],
		});
	});
});
