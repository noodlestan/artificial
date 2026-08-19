import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { makeMockConfig } from '../../../../test/helpers/context/makeMockConfig';
import { makeTempDir } from '../../../../test/helpers/tempDirs/makeTempDir';

import { makeCheckoutFilename } from './makeCheckoutFilename';

const tempDirs: string[] = [];

describe('makeCheckoutFilename', () => {
	it('derives slug from checkout name', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const result = makeCheckoutFilename(config, data);

		expect(result).toBe(join(tempDir, '_records/artificial.art'));
	});

	it('normalizes spaces to dashes', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const data = { name: 'My Checkout', location: 'repos/my-checkout', branch: 'main' };

		const result = makeCheckoutFilename(config, data);

		expect(result).toBe(join(tempDir, '_records/my-checkout.art'));
	});

	it('lowercases the name', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const data = { name: 'UPPER CASE', location: 'repos/upper-case', branch: 'main' };

		const result = makeCheckoutFilename(config, data);

		expect(result).toBe(join(tempDir, '_records/upper-case.art'));
	});

	it('uses config root path and checkouts path', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const data = { name: 'Foo', location: 'repos/foo', branch: 'main' };

		const result = makeCheckoutFilename(config, data);

		expect(result).toContain(config.root.path);
		expect(result).toContain(config.checkouts.path);
	});
});
