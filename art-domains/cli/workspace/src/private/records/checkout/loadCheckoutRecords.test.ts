import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceConfig } from '../../../config';
import { writeCheckoutMockRecord } from '../../../test/helpers/records/writeCheckoutMockRecord';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { loadCheckoutRecords } from './loadCheckoutRecords';

const tempDirs: string[] = [];

function makeMockConfig(
	rootPath: string,
	checkoutPath: string,
	templatePath: string,
): WorkspaceConfig {
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
		writeCheckoutMockRecord(tempDir, 'A', 'A', 'a', 'dev');
		writeCheckoutMockRecord(tempDir, 'B', 'B', 'b', 'main');

		const config = makeMockConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, repos);

		expect(checkouts).toHaveLength(2);
		expect(checkouts[0].repo?.name).toBe('A');
		expect(checkouts[0].checkout.location).toBe('a');
		expect(checkouts[0].checkout.branch).toBe('dev');
		expect(checkouts[0].filename).toBe(join(tempDir, 'ops/records/checkouts/a.art'));
		expect(checkouts[1].repo?.name).toBe('B');
		expect(checkouts[1].filename).toBe(join(tempDir, 'ops/records/checkouts/b.art'));
	});

	it('includes an extraneous checkout for an unknown repo', () => {
		const tempDir = makeTempDir(tempDirs);
		const repoA = { name: 'A', remote: 'git@example.com:a.git' };
		const repoB = { name: 'B', remote: 'git@example.com:b.git' };
		const repos = [repoA, repoB];
		writeCheckoutMockRecord(tempDir, 'A', 'A', 'a');
		writeCheckoutMockRecord(tempDir, 'Unknown', 'Unknown', 'unknown');

		const config = makeMockConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, repos);

		expect(checkouts).toHaveLength(2);
		const unknown = checkouts[1];
		expect(unknown).toBeDefined();
		expect(unknown?.repo?.remote).toBeUndefined();
		expect(unknown?.checkout.name).toBe('Unknown');
		expect(unknown?.checkout.location).toBe('unknown');
		expect(unknown?.checkout.branch).toBe('main');
		expect(unknown?.filename).toBe(join(tempDir, 'ops/records/checkouts/unknown.art'));
	});

	it('skips a checkout record with an empty name', () => {
		const tempDir = makeTempDir(tempDirs);
		const dir = join(tempDir, 'ops/records/checkouts');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'unnamed.art'), '# Module\n\n## Checkout: \n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeMockConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, []);

		expect(checkouts).toEqual([]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('skipped'));
	});

	it('returns an empty list for an empty checkouts dir', () => {
		const tempDir = makeTempDir(tempDirs);
		mkdirSync(join(tempDir, 'ops/records/checkouts'), { recursive: true });

		const config = makeMockConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, []);

		expect(checkouts).toEqual([]);
	});

	it('returns the source file path as filename for each loaded record', () => {
		const tempDir = makeTempDir(tempDirs);
		writeCheckoutMockRecord(tempDir, 'Foo', 'Foo', 'foo');

		const config = makeMockConfig(tempDir, 'ops/records/checkouts', 'checkout.art.njk');
		const checkouts = loadCheckoutRecords(config, []);

		expect(checkouts).toHaveLength(1);
		expect(checkouts[0].filename).toBe(join(tempDir, 'ops/records/checkouts/foo.art'));
	});
});
