import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceConfig } from '../../config/types';
import { makeTempDir } from '../../test/make-temp-dir';
import { removeTempDirs } from '../../test/remove-temp-dirs';

import { readCheckoutRecord } from './read-checkout-record';
import { saveCheckoutRecord } from './save-checkout-record';

const tempDirs: string[] = [];

function makeConfig(checkoutPath: string, templatePath: string): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		root: { path: '.' },
		records: {
			repositories: { path: 'ops/records/repositories' },
			checkouts: { path: checkoutPath, template: templatePath },
		},
	};
}

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('checkout record IO', () => {
	it('saves and reads a checkout record round-trip', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig('ops/records/checkouts', 'template.art.njk');
		const file = join(tempDir, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(config, file, data);
		const read = readCheckoutRecord(file);

		expect(read).toEqual(data);
	});

	it('returns defaults for a missing file', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'missing.art');

		const read = readCheckoutRecord(file);

		expect(read).toEqual({ name: '', location: '', branch: 'main' });
	});

	it('warns and uses defaults for malformed lines', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'malformed.art');
		writeFileSync(file, '# Module\n\n## Checkout: Test\n\n**Location:** `repos/test`\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const read = readCheckoutRecord(file);

		expect(read.name).toBe('Test');
		expect(read.location).toBe('repos/test');
		expect(read.branch).toBe('main');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing branch'));
	});

	it('saved record contains expected markers', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig('ops/records/checkouts', 'template.art.njk');
		const file = join(tempDir, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(config, file, data);
		const content = readFileSync(file, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
		expect(content).toContain('**Branch:** `main`');
	});

	it('renders from the template file when config and root are provided', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig('ops/records/checkouts', 'template.art.njk');
		const file = join(tempDir, 'ops/records/checkouts/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(config, file, data);
		const content = readFileSync(file, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});

	it('falls back to hardcoded template when template file is missing', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig('ops/records/checkouts', 'nonexistent-template.art.njk');
		const file = join(tempDir, 'ops/records/checkouts/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(config, file, data);
		const content = readFileSync(file, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});
});
