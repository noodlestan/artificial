import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createBranchFailure } from '../../private/operations/createBranchFailure';
import { createBranchSuccess } from '../../private/operations/createBranchSuccess';
import { createCheckout } from '../../private/store/create-checkout';
import { commitFile } from '../../test/commit-file';
import { createCommandContext } from '../../test/create-command-context';
import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';
import { writeRepoRecord } from '../../test/writeRepoRecord';

import { runBranch } from './runBranch';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('createBranchSuccess', () => {
	it('factory defaults and serialization', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const checkout = createCheckout(
			ctx.config,
			'bug-fix',
			{ name: 'One', remote: 'git@example.com:one.git' },
			'main',
		);

		const success = createBranchSuccess(checkout, 'feat/x');
		expect(success.message()).toBe('created feat/x');
	});
});

describe('createBranchFailure', () => {
	it('factory defaults and serialization', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const checkout = createCheckout(
			ctx.config,
			'bug-fix',
			{ name: 'One', remote: 'git@example.com:one.git' },
			'main',
		);

		const failure = createBranchFailure('feat/x', new Error('boom (reason)'), checkout);
		expect(failure.errorSerialized()).toContain('boom');
		expect(failure.errorSerialized()).toContain('reason');
	});
});

describe('branch command', () => {
	it('creates and checks out a new branch in a single specified checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const repoDir = join(tempDir, ctx.config.clone.path, 'one');
		await initGitRepo(repoDir);

		writeRepoRecord(tempDir, 'One', 'git@example.com:one.git');
		writeCheckoutRecord(tempDir, 'One', 'One', 'one');

		await runBranch(ctx, { branch: 'feat/x', checkoutLocations: ['one'] });

		const checkout = ctx.store.getCheckoutOfRepo('One');
		expect(checkout).toBeDefined();
		expect(checkout?.record.branch).toBe('feat/x');

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('branch created');
		expect(ops[0].outcome).toBe('success');
		expect(ops[0].message()).toBe('created feat/x');
	});

	it('branches all checkouts when none are specified', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		await initGitRepo(join(tempDir, ctx.config.clone.path, 'alpha'));
		await initGitRepo(join(tempDir, ctx.config.clone.path, 'beta'));

		writeRepoRecord(tempDir, 'Alpha', 'git@example.com:alpha.git');
		writeRepoRecord(tempDir, 'Beta', 'git@example.com:beta.git');
		writeCheckoutRecord(tempDir, 'Alpha', 'Alpha', 'alpha');
		writeCheckoutRecord(tempDir, 'Beta', 'Beta', 'beta');

		await runBranch(ctx, { branch: 'feat/x', checkoutLocations: [] });

		const ops = ctx.log.all();
		expect(ops).toHaveLength(2);
		expect(ops.every(o => o.operation === 'branch created' && o.outcome === 'success')).toBe(true);
		expect(ctx.store.getCheckoutOfRepo('Alpha')?.record.branch).toBe('feat/x');
		expect(ctx.store.getCheckoutOfRepo('Beta')?.record.branch).toBe('feat/x');
	});

	it('warns and skips a checkout that is not cloned yet', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		await initGitRepo(join(tempDir, ctx.config.clone.path, 'repos/one'));

		writeRepoRecord(tempDir, 'One', 'git@example.com:one.git');
		writeCheckoutRecord(tempDir, 'One', 'One', 'one');

		await runBranch(ctx, { branch: 'feat/x', checkoutLocations: ['Nope'] });

		const ops = ctx.log.all();
		expect(ops.length).toEqual(1);
		expect(ops[0].message()).toBe('not cloned');
	});

	it('logs a failure and continues when a checkout is not cloned', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		await initGitRepo(join(tempDir, ctx.config.clone.path, 'repos/good'));

		writeRepoRecord(tempDir, 'Good', 'git@example.com:good.git');
		writeRepoRecord(tempDir, 'Missing', 'git@example.com:missing.git');
		writeCheckoutRecord(tempDir, 'Good', 'Good', 'good');
		writeCheckoutRecord(tempDir, 'Missing', 'Missing', 'missing');

		await runBranch(ctx, { branch: 'feat/x', checkoutLocations: ['Missing', 'Good'] });

		const ops = ctx.log.all();
		expect(ops.length).toEqual(2);
		const failure = ops.find(o => o.outcome === 'failure');
		expect(failure).toBeDefined();
		expect(failure?.operation).toBe('branch created');
		expect(failure?.message()).toContain('not cloned');
		expect(ctx.store.getCheckoutOfRepo('Good')?.record.branch).toBe('main');
	});

	it.only('branches a checkout with no matching repository', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		await initGitRepo(join(tempDir, ctx.config.clone.path, 'conv'));

		writeCheckoutRecord(tempDir, 'Conv', 'Conv', 'conv');

		await runBranch(ctx, { branch: 'feat/x', checkoutLocations: ['conv'] });

		const checkout = ctx.store.getCheckoutForLocation('conv');
		expect(checkout).toBeDefined();
		expect(checkout?.repo).toBeUndefined();
		expect(checkout?.record.branch).toBe('feat/x');
		expect(ctx.log.all()).toHaveLength(1);
		expect(ctx.log.all()[0].outcome).toBe('success');
		expect(ctx.log.all()[0].message()).toBe('created feat/x');
	});

	it.only('switches to an existing branch', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const repoDir = join(tempDir, ctx.config.clone.path, 'one');
		await initGitRepo(repoDir);
		const git = simpleGit(repoDir);
		await commitFile(repoDir, 'file.txt');
		await git.checkoutLocalBranch('feat/x');
		await git.checkoutLocalBranch('feat/y');

		writeRepoRecord(tempDir, 'One', 'git@example.com:one.git');
		writeCheckoutRecord(tempDir, 'One', 'One', 'one');

		await runBranch(ctx, { branch: 'feat/x', checkoutLocations: ['one'] });

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('success');
		expect(ops[0].message()).toBe('switched to feat/x');
		expect(ctx.store.getCheckoutOfRepo('One')?.record.branch).toBe('feat/x');
	});
});
