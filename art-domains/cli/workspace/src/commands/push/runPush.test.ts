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

import { runPush } from './runPush';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('push command', () => {
	it('pushes clean checkouts that are ahead', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'ahead');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'ahead.txt');

		writeRepoRecord(tempDir, 'Ahead', 'git@example.com:ahead.git');
		writeCheckoutRecord(tempDir, 'Ahead', 'Ahead', 'ahead');

		await runPush(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Ahead');
		expect(checkout?.scan?.unpushed).toBe(0);
		expect(checkout?.scan?.issues).toEqual([]);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('push');
		expect(ops[0].outcome).toBe('success');
		expect(ops[0].message()).toBe('to origin/main');

		const verifyDir = makeTempDir(tempDirs);
		await simpleGit(verifyDir).clone(bareDir, verifyDir);
		expect(existsSync(join(verifyDir, 'ahead.txt'))).toBe(true);
	});

	it('tries pull first if behind', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'diverged');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'ahead.txt');
		await makeOriginAhead(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');

		writeRepoRecord(tempDir, 'Diverged', 'git@example.com:diverged.git');
		writeCheckoutRecord(tempDir, 'Diverged', 'Diverged', 'diverged');

		await runPush(ctx);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(2);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('success');
		expect(ops[1].operation).toBe('push');
		expect(ops[1].outcome).toBe('success');

		const checkout = ctx.store.getCheckoutOfRepo('Diverged');
		expect(checkout?.scan?.unpushed).toBe(0);
		expect(checkout?.scan?.isBehind).toBe(false);
		expect(checkout?.scan?.issues).toEqual([]);

		const verifyDir = makeTempDir(tempDirs);
		await simpleGit(verifyDir).clone(bareDir, verifyDir);
		expect(existsSync(join(verifyDir, 'ahead.txt'))).toBe(true);
		expect(existsSync(join(verifyDir, 'origin.txt'))).toBe(true);
	});

	it('skips dirty checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'dirtypush');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'ahead.txt');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoRecord(tempDir, 'DirtyPush', 'git@example.com:dirtypush.git');
		writeCheckoutRecord(tempDir, 'DirtyPush', 'DirtyPush', 'dirtypush');

		await runPush(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('DirtyPush');
		expect(checkout?.scan?.issues).toEqual(['uncommitted files', '1 commit ahead']);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips checkouts already up to date', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'current');
		await initWorkingRepo(repoDir, bareDir);

		writeRepoRecord(tempDir, 'Current', 'git@example.com:current.git');
		writeCheckoutRecord(tempDir, 'Current', 'Current', 'current');

		await runPush(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Current');
		expect(checkout?.scan?.unpushed).toBe(0);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips checkouts not cloned', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		writeRepoRecord(tempDir, 'Missing', 'git@example.com:missing.git');
		writeCheckoutRecord(tempDir, 'Missing', 'Missing', 'missing');

		await runPush(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Missing');
		expect(checkout?.scan?.exists).toBe(false);
		expect(checkout?.scan?.issues).toEqual(['not cloned']);
		expect(ctx.log.all()).toHaveLength(0);
	});
});
