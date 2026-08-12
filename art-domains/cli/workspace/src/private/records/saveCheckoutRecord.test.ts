import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { makeConfig } from '../../test/makeConfig';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { saveCheckoutRecord } from './saveCheckoutRecord';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('saveCheckoutRecord', () => {
	it('saved record contains expected markers', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig(tempDir);
		const file = join(tempDir, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, file, data);
		const content = readFileSync(saved, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
		expect(content).toContain('**Branch:** `main`');
	});

	it('renders from the template file when config and root are provided', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig(tempDir);
		const file = join(tempDir, 'ops/records/checkouts/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, file, data);
		const content = readFileSync(saved, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});

	it('falls back to hardcoded template when template file is missing', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig(tempDir);
		const file = join(tempDir, 'ops/records/checkouts/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, file, data);
		const content = readFileSync(saved, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});
});
