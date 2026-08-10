import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceConfig } from '../../config/types';

import { loadCheckouts, readCheckoutRecord, saveCheckoutRecord } from './checkout-record';

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

describe('loadCheckouts', () => {
	function writeRepoRecord(root: string, name: string, remote: string) {
		const dir = join(root, 'ops/records/repositories');
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, `${name.toLowerCase().replace(/\s+/g, '-')}.art`),
			`## Repository: ${name}\n\n**Remote:** \`${remote}\`\n`,
		);
	}

	function writeCheckoutRecordFile(
		root: string,
		name: string,
		location: string,
		branch = 'main',
		filename?: string,
	) {
		const dir = join(root, 'ops/records/checkouts');
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, filename ?? `${name.toLowerCase().replace(/\s+/g, '-')}.art`),
			`## Checkout: ${name}\n\n**Location:** \`${location}\`\n\n**Branch:** \`${branch}\`\n`,
		);
	}

	it('loads checkouts with repos resolved by name', () => {
		const root = makeTempDir();
		writeRepoRecord(root, 'A', 'git@example.com:a.git');
		writeRepoRecord(root, 'B', 'git@example.com:b.git');
		writeCheckoutRecordFile(root, 'A', 'repos/a', 'dev');
		writeCheckoutRecordFile(root, 'B', 'repos/b', 'main');

		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		expect(checkouts).toHaveLength(2);
		expect(checkouts[0].repo.name).toBe('A');
		expect(checkouts[0].location).toBe('repos/a');
		expect(checkouts[0].branch).toBe('dev');
		expect(checkouts[1].repo.name).toBe('B');
	});

	it('warns and skips a checkout for an unknown repo', () => {
		const root = makeTempDir();
		writeRepoRecord(root, 'A', 'git@example.com:a.git');
		writeCheckoutRecordFile(root, 'A', 'repos/a');
		writeCheckoutRecordFile(root, 'Unknown', 'repos/unknown');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		expect(checkouts).toHaveLength(1);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown'));
	});

	it('returns an empty list for an empty checkouts dir', () => {
		const root = makeTempDir();
		mkdirSync(join(root, 'ops/records/checkouts'), { recursive: true });

		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		expect(checkouts).toEqual([]);
	});

	it('returns two entries when two checkout records reference the same repo', () => {
		const root = makeTempDir();
		writeRepoRecord(root, 'A', 'git@example.com:a.git');
		writeCheckoutRecordFile(root, 'A', 'repos/a', 'main', 'a-main.art');
		writeCheckoutRecordFile(root, 'A', 'repos/a-dev', 'dev', 'a-dev.art');

		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		expect(checkouts).toHaveLength(2);
		expect(checkouts.map(c => c.location).sort()).toEqual(['repos/a', 'repos/a-dev']);
	});
});
