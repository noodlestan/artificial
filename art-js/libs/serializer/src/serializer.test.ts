import { readFileSync } from 'fs';
import { resolve } from 'path';

import type { ArtDocument } from '@art-js/artificial-constructs';
import { parse } from '@art-js/artificial-parser';
import { describe, expect, it } from 'vitest';

import { serialize } from './serializer';

describe('serialize', () => {
	it('serializes a Document with nested SectionBlocks', () => {
		const doc: ArtDocument = {
			construct: 'Document',
			children: [
				{
					construct: 'SectionBlock',
					name: 'Title',
					depth: 1,
					children: [],
				},
			],
		};
		const result = serialize(doc);
		expect(result).toContain('# Title');
	});

	it('serializes a Document with FieldBlocks', () => {
		const doc: ArtDocument = {
			construct: 'Document',
			children: [
				{
					construct: 'SectionBlock',
					name: 'Module',
					depth: 1,
					children: [
						{
							construct: 'FieldBlock',
							name: 'Purpose',
							value: [
								{
									construct: 'NaturalBlock',
									type: 'text',
									value: ' Test purpose',
								},
							],
						},
					],
				},
			],
		};
		const result = serialize(doc);
		expect(result).toContain('**Purpose:** Test purpose');
	});

	it('serializes a Document with NaturalBlocks', () => {
		const doc: ArtDocument = {
			construct: 'Document',
			children: [
				{
					construct: 'NaturalBlock',
					type: 'text',
					value: ' Hello world',
				},
			],
		};
		const result = serialize(doc);
		expect(result).toContain('Hello world');
	});

	it('serializes a Document with Tags', () => {
		const doc = {
			construct: 'Document',
			children: [
				{
					construct: 'Tag',
					name: 'READ',
				},
			],
		} as unknown as ArtDocument;
		const result = serialize(doc);
		expect(result).toContain('@READ');
	});

	it('throws on unknown construct', () => {
		const doc = {
			construct: 'Document',
			children: [{ construct: 'UnknownConstruct' }],
		} as unknown as ArtDocument;
		expect(() => serialize(doc)).toThrow('Unknown construct: UnknownConstruct');
	});

	it('roundtrips field-block.md.json fixture', () => {
		const fixturePath = resolve(__dirname, '../../parser/test/fixtures/_field-block.md.json');
		const artDoc = JSON.parse(readFileSync(fixturePath, 'utf8')) as ArtDocument;
		const result = serialize(artDoc);
		expect(result).toContain('# Field Block Fixtures');
		expect(result).toContain('## Artificial');
		expect(result).toContain('**Purpose:** Generate and manage agent instructions.');
		expect(result).toContain('**Canonical Name:** `@noodlestan/artificial`');
	});

	it('roundtrip smoke test: field-block.md parse then serialize', () => {
		const mdPath = resolve(__dirname, '../../parser/test/fixtures/_field-block.md');
		const markdown = readFileSync(mdPath, 'utf8');
		const doc = parse(markdown);
		const result = serialize(doc);
		expect(result).toContain('# Field Block Fixtures');
		expect(result).toContain('**Purpose:**');
	});
});
