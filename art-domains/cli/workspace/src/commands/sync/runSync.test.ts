import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { commitFile } from '../../test/commitFile';
import { createCommandContext } from '../../test/createCommandContext';
import { initWorkingRepo } from '../../test/initWorkingRepo';
import { makeOriginAhead } from '../../test/makeOriginAhead';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';
import { writeRepoRecord } from '../../test/writeRepoRecord';

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
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'syncme');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'ahead.txt');
		await makeOriginAhead(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');

		writeRepoRecord(tempDir, 'SyncMe', 'git@example.com:syncme.git');
		writeCheckoutRecord(tempDir, 'SyncMe', 'SyncMe', 'syncme');

		await runSync(ctx);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(2);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('success');
		expect(ops[1].operation).toBe('push');
		expect(ops[1].outcome).toBe('success');

		const checkout = ctx.store.getCheckoutOfRepo('SyncMe');
		expect(checkout?.unpushed).toBe(0);
		expect(checkout?.isBehind).toBe(false);
		expect(checkout?.issues).toEqual([]);

		const verifyDir = makeTempDir(tempDirs);
		await simpleGit(verifyDir).clone(bareDir, verifyDir);
		expect(existsSync(join(verifyDir, 'ahead.txt'))).toBe(true);
		expect(existsSync(join(verifyDir, 'origin.txt'))).toBe(true);
	});

	it('skips dirty checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'dirtysync');
		await initWorkingRepo(repoDir, bareDir);
		await makeOriginAhead(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoRecord(tempDir, 'DirtySync', 'git@example.com:dirtysync.git');
		writeCheckoutRecord(tempDir, 'DirtySync', 'DirtySync', 'dirtysync');

		await runSync(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('DirtySync');
		expect(checkout?.issues).toEqual(['uncommitted files', '1 commit behind']);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips checkouts not cloned', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		writeRepoRecord(tempDir, 'Missing', 'git@example.com:missing.git');
		writeCheckoutRecord(tempDir, 'Missing', 'Missing', 'missing');

		await runSync(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Missing');
		expect(checkout?.exists).toBe(false);
		expect(checkout?.issues).toEqual(['not cloned']);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('works on up to date checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'current');
		await initWorkingRepo(repoDir, bareDir);

		writeRepoRecord(tempDir, 'Current', 'git@example.com:current.git');
		writeCheckoutRecord(tempDir, 'Current', 'Current', 'current');

		await runSync(ctx);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('success');

		const checkout = ctx.store.getCheckoutOfRepo('Current');
		expect(checkout?.unpushed).toBe(0);
		expect(checkout?.isBehind).toBe(false);
		expect(checkout?.issues).toEqual([]);
	});
});
