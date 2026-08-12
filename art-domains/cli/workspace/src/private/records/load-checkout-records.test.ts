import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceConfig } from '../../config';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';

import { loadCheckoutRecords } from './loadCheckoutRecords';

const tempDirs: string[] = [];

function makeConfig(rootPath: string, checkoutPath: string, templatePath: string): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		root: { path: rootPath },
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

describe('loadCheckouts', () => {
	it('loads checkouts with repos resolved by name', () => {
		const tempDir = makeTempDir(tempDirs);

		const repoA = { name: 'A', remote: 'git@example.com:a.git' };
		const repoB = { name: 'B', remote: 'git@example.com:b.git' };
		const repos = [repoA, repoB];
		writeCheckoutRecord(tempDir, 'A', 'A', 'a', 'dev');
		writeCheckoutRecord(tempDir, 'B', 'B', 'b', 'main');

		const config = makeConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, repos);

		expect(checkouts).toHaveLength(2);
		expect(checkouts[0].repo?.name).toBe('A');
		expect(checkouts[0].checkout.location).toBe('a');
		expect(checkouts[0].checkout.branch).toBe('dev');
		expect(checkouts[1].repo?.name).toBe('B');
	});

	it('includes an extraneous checkout for an unknown repo', () => {
		const tempDir = makeTempDir(tempDirs);
		const repoA = { name: 'A', remote: 'git@example.com:a.git' };
		const repoB = { name: 'B', remote: 'git@example.com:b.git' };
		const repos = [repoA, repoB];
		writeCheckoutRecord(tempDir, 'A', 'A', 'a');
		writeCheckoutRecord(tempDir, 'Unknown', 'Unknown', 'unknown');

		const config = makeConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, repos);

		expect(checkouts).toHaveLength(2);
		const unknown = checkouts[1];
		expect(unknown).toBeDefined();
		expect(unknown?.repo?.remote).toBeUndefined();
		expect(unknown?.checkout.name).toBe('Unknown');
		expect(unknown?.checkout.location).toBe('unknown');
		expect(unknown?.checkout.branch).toBe('main');
	});

	it('skips a checkout record with an empty name', () => {
		const tempDir = makeTempDir(tempDirs);
		const dir = join(tempDir, 'ops/records/checkouts');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'unnamed.art'), '# Module\n\n## Checkout: \n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, []);

		expect(checkouts).toEqual([]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('skipped'));
	});

	it('returns an empty list for an empty checkouts dir', () => {
		const tempDir = makeTempDir(tempDirs);
		mkdirSync(join(tempDir, 'ops/records/checkouts'), { recursive: true });

		const config = makeConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, []);

		expect(checkouts).toEqual([]);
	});
});
