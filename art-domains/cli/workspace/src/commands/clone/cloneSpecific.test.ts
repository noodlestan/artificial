import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { initBareRepoTest } from '../../test/helpers/git/initBareRepoTest';
import { writeCheckoutMockRecord } from '../../test/helpers/records/writeCheckoutMockRecord';
import { writeRepoMockRecord } from '../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { cloneSpecific } from './cloneSpecific';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('cloneSpecific', () => {
	it('unknown repo logs failure containing unknown repo', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const spy = vi.spyOn(ctx.log, 'log');

		await cloneSpecific(ctx, [], 'nope');

		expect(spy).toHaveBeenCalledTimes(1);
		const op = spy.mock.calls[0][0];
		expect(op.message()).toContain('unknown repo "nope"');
	});

	it('clones a missing repo and creates the checkout record', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		const bareDir = join(tempDir, 'bare/one');
		await initBareRepoTest(bareDir);
		writeRepoMockRecord(tempDir, 'One', bareDir);

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

	it('creates second checkout when repo already exists at different location', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		const bareDir = join(tempDir, 'bare/foo');
		await initBareRepoTest(bareDir);
		writeRepoMockRecord(tempDir, 'Foo', bareDir);
		writeCheckoutMockRecord(tempDir, 'Foo', 'Foo', 'foo');

		const repos = loadRepositoryRecords(ctx.config);
		hydrateStoreFromRecords(ctx.config, ctx.store, loadCheckoutRecords(ctx.config, repos));
		await cloneSpecific(ctx, repos, 'Foo', 'bar');

		const ops = ctx.log.all();
		const cloneOps = ops.filter(op => op.operation === 'clone');
		expect(cloneOps.some(op => op.outcome === 'success')).toBe(true);

		const recordFile = join(tempDir, 'ops/records/checkouts/foo-@-bar.art');
		expect(existsSync(recordFile)).toBe(true);
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('## Checkout: Foo @ bar');
		expect(content).toContain('**Location:** `foo-bar`');
	});

	it('logs failure when the location is already used by a different checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		writeRepoMockRecord(tempDir, 'One', 'git@example.com:one.git');
		writeRepoMockRecord(tempDir, 'Two', 'git@example.com:two.git');
		writeCheckoutMockRecord(tempDir, 'Two', 'Two', 'one custom');

		const repos = loadRepositoryRecords(ctx.config);
		hydrateStoreFromRecords(ctx.config, ctx.store, loadCheckoutRecords(ctx.config, repos));
		await cloneSpecific(ctx, repos, 'One', 'custom');

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('failure');
		expect(ops[0].message()).toContain("location one-custom is already used by checkout 'Two'.");
	});

	it('logs failure when target directory already exists on disk', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		writeRepoMockRecord(tempDir, 'One', 'git@example.com:one.git');

		const targetDir = join(tempDir, ctx.config.clone.path, 'one');
		mkdirSync(targetDir, { recursive: true });

		const repos = loadRepositoryRecords(ctx.config);
		await cloneSpecific(ctx, repos, 'One');

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('failure');
		expect(ops[0].message()).toContain('directory already exists at');
	});
});
