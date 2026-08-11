import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceConfig } from '../../config/types';

import { readCheckoutRecord, saveCheckoutRecord } from './checkout-record';

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-checkout-record-test-'));
	tempDirs.push(dir);
	return dir;
}

function makeConfig(checkoutPath: string, templatePath: string): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		records: {
			repositories: { path: 'ops/records/repositories' },
			checkouts: { path: checkoutPath, template: templatePath },
		},
	};
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
	vi.restoreAllMocks();
});

describe('checkout record IO', () => {
	it('saves and reads a checkout record round-trip', () => {
		const root = makeTempDir();
		const file = join(root, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(file, data);
		const read = readCheckoutRecord(file);

		expect(read).toEqual(data);
	});

	it('returns defaults for a missing file', () => {
		const root = makeTempDir();
		const file = join(root, 'missing.art');

		const read = readCheckoutRecord(file);

		expect(read).toEqual({ name: '', location: '', branch: 'main' });
	});

	it('warns and uses defaults for malformed lines', () => {
		const root = makeTempDir();
		const file = join(root, 'malformed.art');
		writeFileSync(file, '# Module\n\n## Checkout: Test\n\n**Location:** `repos/test`\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const read = readCheckoutRecord(file);

		expect(read.name).toBe('Test');
		expect(read.location).toBe('repos/test');
		expect(read.branch).toBe('main');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing branch'));
	});

	it('saved record contains expected markers', () => {
		const root = makeTempDir();
		const file = join(root, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(file, data);
		const content = readFileSync(file, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
		expect(content).toContain('**Branch:** `main`');
	});

	it('renders from the template file when config and root are provided', () => {
		const root = makeTempDir();
		const templateFile = join(root, 'template.art.njk');
		writeFileSync(
			templateFile,
			`# Module

## Checkout: {{ name }}

**Location:** \`{{ location }}\`

**Branch:** \`{{ branch }}\`
`,
		);
		const config = makeConfig('ops/records/checkouts', 'template.art.njk');
		const file = join(root, 'ops/records/checkouts/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(file, data, config, root);
		const content = readFileSync(file, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});

	it('falls back to hardcoded template when template file is missing', () => {
		const root = makeTempDir();
		const config = makeConfig('ops/records/checkouts', 'nonexistent-template.art.njk');
		const file = join(root, 'ops/records/checkouts/test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		saveCheckoutRecord(file, data, config, root);
		const content = readFileSync(file, 'utf-8');

		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
	});
});
