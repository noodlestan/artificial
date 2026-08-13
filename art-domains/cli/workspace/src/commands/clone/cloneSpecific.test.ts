import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { createCommandContext } from '../../test/createCommandContext';
import { initBareRepo } from '../../test/initBareRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';
import { writeRepoRecord } from '../../test/writeRepoRecord';

import { cloneSpecific } from './cloneSpecific';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('cloneSpecific', () => {
	it('unknown repo logs failure containing unknown repo', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const spy = vi.spyOn(ctx.log, 'log');

		await cloneSpecific(ctx, [], 'nope');

		expect(spy).toHaveBeenCalledTimes(1);
		const op = spy.mock.calls[0][0];
		expect(op.message()).toContain('unknown repo "nope"');
	});

	it('clones a missing repo and creates the checkout record', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const bareDir = join(tempDir, 'bare/one');
		await initBareRepo(bareDir);
		writeRepoRecord(tempDir, 'One', bareDir);

		const repos = loadRepositoryRecords(ctx.config);
		await cloneSpecific(ctx, repos, 'One');

		const repoDir = join(tempDir, ctx.config.clone.path, 'one');
		expect(() => simpleGit(repoDir).status()).not.toThrow();

		const recordFile = join(tempDir, 'ops/records/checkouts/one.art');
		expect(existsSync(recordFile)).toBe(true);
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('## Checkout: One');
		expect(content).toContain('**Location:** `one`');
	});

	it('logs failure when the location is already used by a different checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		writeRepoRecord(tempDir, 'One', 'git@example.com:one.git');
		writeRepoRecord(tempDir, 'Two', 'git@example.com:two.git');
		writeCheckoutRecord(tempDir, 'Two', 'Two', 'one custom');

		const repos = loadRepositoryRecords(ctx.config);
		hydrateStoreFromRecords(ctx, loadCheckoutRecords(ctx.config, repos));
		await cloneSpecific(ctx, repos, 'One', 'custom');

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('failure');
		expect(ops[0].message()).toContain("location one-custom is already used by checkout 'Two'.");
	});
});
