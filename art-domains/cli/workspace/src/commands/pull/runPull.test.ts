import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { initWorkingRepo } from '../../test/initWorkingRepo';
import { makeOriginAhead } from '../../test/makeOriginAhead';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';
import { writeRepoRecord } from '../../test/writeRepoRecord';

import { runPull } from './runPull';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('pull command', () => {
	it('pulls clean checkouts that are behind', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'behind');
		await initWorkingRepo(repoDir, bareDir);
		await makeOriginAhead(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');

		writeRepoRecord(tempDir, 'Behind', 'git@example.com:behind.git');
		writeCheckoutRecord(tempDir, 'Behind', 'Behind', 'behind');

		await runPull(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Behind');
		expect(checkout?.scan?.isBehind).toBe(false);
		expect(checkout?.scan?.issues).toEqual([]);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('success');
		expect(ops[0].message()).toBe('from origin/main');

		expect(existsSync(join(repoDir, 'origin.txt'))).toBe(true);
	});

	it('skips dirty checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'dirty');
		await initWorkingRepo(repoDir, bareDir);
		await makeOriginAhead(bareDir, tempDirs);
		await simpleGit(repoDir).fetch('origin', 'main');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoRecord(tempDir, 'Dirty', 'git@example.com:dirty.git');
		writeCheckoutRecord(tempDir, 'Dirty', 'Dirty', 'dirty');

		await runPull(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Dirty');
		expect(checkout?.scan?.issues).toEqual(['uncommitted files', '1 commit behind']);
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

		await runPull(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Current');
		expect(checkout?.scan?.isBehind).toBe(false);
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips checkouts not cloned', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		writeRepoRecord(tempDir, 'Missing', 'git@example.com:missing.git');
		writeCheckoutRecord(tempDir, 'Missing', 'Missing', 'missing');

		await runPull(ctx);

		const checkout = ctx.store.getCheckoutOfRepo('Missing');
		expect(checkout?.scan?.exists).toBe(false);
		expect(checkout?.scan?.issues).toEqual(['not cloned']);
		expect(ctx.log.all()).toHaveLength(0);
	});
});
