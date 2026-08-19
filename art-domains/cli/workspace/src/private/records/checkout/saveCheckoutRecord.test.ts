import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { makeMockConfig } from '../../../test/helpers/context/makeMockConfig';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { saveCheckoutRecord } from './saveCheckoutRecord';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('saveCheckoutRecord', () => {
	it('saved record contains expected markers', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const file = join(tempDir, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, data, file);
		const content = readFileSync(saved, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
		expect(content).toContain('**Branch:** `main`');
	});

	it('renders from the template file when config and root are provided', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const file = join(tempDir, '_records/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, data, file);
		const content = readFileSync(saved, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});

	it('falls back to hardcoded template when template file is missing', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const file = join(tempDir, '_records/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, data, file);
		const content = readFileSync(saved, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});

	it('generates filename when no explicit file is provided', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const data = { name: 'My Checkout', location: 'repos/my-checkout', branch: 'main' };

		const saved = await saveCheckoutRecord(config, data);
		const content = readFileSync(saved, 'utf-8');

		expect(saved).toBe(join(tempDir, '_records/my-checkout-checkout.art'));
		expect(content).toContain('## Checkout: My Checkout');
	});
});
