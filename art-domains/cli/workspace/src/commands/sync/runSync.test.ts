import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { commitFileTest } from '../../test/helpers/git/commitFileTest';
import { initWorkingRepoTest } from '../../test/helpers/git/initWorkingRepoTest';
import { makeOriginAheadTest } from '../../test/helpers/git/makeOriginAheadTest';
import { writeCheckoutMockRecord } from '../../test/helpers/records/writeCheckoutMockRecord';
import { writeRepoMockRecord } from '../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { runSync } from './runSync';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('sync command', () => {
	it('syncs clean checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'syncme');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'ahead.txt');
		await makeOriginAheadTest(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');

		writeRepoMockRecord(tempDir, 'SyncMe', 'git@example.com:syncme.git');
		writeCheckoutMockRecord(tempDir, 'SyncMe', 'SyncMe', 'syncme');

		await runSync(ctx);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(2);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('success');
		expect(ops[1].operation).toBe('push');
		expect(ops[1].outcome).toBe('success');

		const checkout = ctx.store.getCheckoutOfRepo('SyncMe');
		expect(checkout?.scan?.state('sync').delta).toBe(0);
		expect(checkout?.scan?.issues()).toEqual([]);

		const verifyDir = makeTempDir(tempDirs);
		await simpleGit(verifyDir).clone(bareDir, verifyDir);
		expect(existsSync(join(verifyDir, 'ahead.txt'))).toBe(true);
		expect(existsSync(join(verifyDir, 'origin.txt'))).toBe(true);
	});

	it('skips dirty checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'dirtysync');
		await initWorkingRepoTest(repoDir, bareDir);
		await makeOriginAheadTest(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoMockRecord(tempDir, 'DirtySync', 'git@example.com:dirtysync.git');
		writeCheckoutMockRecord(tempDir, 'DirtySync', 'DirtySync', 'dirtysync');

		await runSync(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('DirtySync');
		expect(checkout?.scan?.issues()).toEqual(['uncommitted files', '1 commit behind']);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips checkouts not cloned', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		writeRepoMockRecord(tempDir, 'Missing', 'git@example.com:missing.git');
		writeCheckoutMockRecord(tempDir, 'Missing', 'Missing', 'missing');

		await runSync(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Missing');
		expect(checkout?.scan?.state('exists').exists).toBe(false);
		expect(checkout?.scan?.issues()).toEqual(['not cloned']);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('works on up to date checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'current');
		await initWorkingRepoTest(repoDir, bareDir);

		writeRepoMockRecord(tempDir, 'Current', 'git@example.com:current.git');
		writeCheckoutMockRecord(tempDir, 'Current', 'Current', 'current');

		await runSync(ctx);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(0);

		const checkout = ctx.store.getCheckoutOfRepo('Current');
		expect(checkout?.scan?.state('sync').delta).toBe(0);
		expect(checkout?.scan?.issues()).toEqual([]);
	});
});
