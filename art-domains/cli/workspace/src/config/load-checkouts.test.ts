import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadCheckouts } from './load-checkouts';
import type { WorkspaceConfig } from './types';

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

	it('warns and includes a checkout for an unknown repo with a synthetic repository', () => {
		const root = makeTempDir();
		writeRepoRecord(root, 'A', 'git@example.com:a.git');
		writeCheckoutRecordFile(root, 'A', 'repos/a');
		writeCheckoutRecordFile(root, 'Unknown', 'repos/unknown');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		expect(checkouts).toHaveLength(2);
		const unknown = checkouts.find(c => c.repo.name === 'Unknown');
		expect(unknown).toBeDefined();
		expect(unknown?.repo.remote).toBe('');
		expect(unknown?.location).toBe('repos/unknown');
		expect(unknown?.branch).toBe('main');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown'));
	});

	it('applies defaults for a record with missing location and branch', () => {
		const root = makeTempDir();
		writeRepoRecord(root, 'B', 'git@example.com:b.git');
		const dir = join(root, 'ops/records/checkouts');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'b.art'), '# Module\n\n## Checkout: B\n');

		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		const b = checkouts.find(c => c.repo.name === 'B');
		expect(b).toBeDefined();
		expect(b?.location).toBe('');
		expect(b?.branch).toBe('main');
	});

	it('skips a checkout record with an empty name', () => {
		const root = makeTempDir();
		const dir = join(root, 'ops/records/checkouts');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'unnamed.art'), '# Module\n\n## Checkout: \n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeConfig('ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckouts(config, root);

		expect(checkouts).toEqual([]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('skipped'));
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
