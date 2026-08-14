/* eslint-disable no-console */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { commitFile } from '../../test/commitFile';
import { createCommandContext } from '../../test/createCommandContext';
import { initWorkingRepo } from '../../test/initWorkingRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';
import { writeRepoRecord } from '../../test/writeRepoRecord';

import { runSanity } from './runSanity';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('sanity command', () => {
	it('reports "not cloned" for a missing checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		writeRepoRecord(tempDir, 'Foo Bar', 'git@example.com:foo-bar.git');
		writeCheckoutRecord(tempDir, 'Foo Bar', 'Foo Bar', 'foo-bar', 'ouch');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(false);
		expect(checkouts[0].issues).toEqual(['not cloned']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows repo status when all repos are clean', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'green');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);

		writeRepoRecord(tempDir, 'Green', 'git@example.com:green.git');
		writeCheckoutRecord(tempDir, 'Green', 'Green', 'green');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual([]);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows dirty repo with issues', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'dirty');
		await initWorkingRepo(repoDir, bareDir);
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoRecord(tempDir, 'Dirty', 'git@example.com:dirty.git');
		writeCheckoutRecord(tempDir, 'Dirty', 'Dirty', 'dirty');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual(['uncommitted files']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows clean unpushed repo without --auto', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'unpushed');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt');

		writeRepoRecord(tempDir, 'Unpushed', 'git@example.com:unpushed.git');
		writeCheckoutRecord(tempDir, 'Unpushed', 'Unpushed', 'unpushed');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual(['1 commit ahead']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('pushes clean unpushed repo with --auto', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'autopush');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		await commitFile(repoDir, 'file2.txt');

		writeRepoRecord(tempDir, 'AutoPush', 'git@example.com:autopush.git');
		writeCheckoutRecord(tempDir, 'AutoPush', 'AutoPush', 'autopush');

		await runSanity(ctx, { auto: true });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual([]);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(1);
		expect(ops[0].operation).toEqual('push');
		expect(ops[0].message()).toEqual('to origin/main');
	});

	it('does not push dirty repo with --auto', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'dirtynoauto');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoRecord(tempDir, 'DirtyNoAuto', 'git@example.com:dirtynoauto.git');
		writeCheckoutRecord(tempDir, 'DirtyNoAuto', 'DirtyNoAuto', 'dirtynoauto');

		await runSanity(ctx, { auto: true });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual(['uncommitted files', '1 commit ahead']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('surfaces detached HEAD', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'detached');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		const headSha = await git.revparse(['HEAD']);
		await git.checkout(headSha.trim());

		writeRepoRecord(tempDir, 'Detached', 'git@example.com:detached.git');
		writeCheckoutRecord(tempDir, 'Detached', 'Detached', 'detached');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual(['detached HEAD']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('surfaces merge conflicts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'conflict');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt', 'base');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);

		await git.checkoutLocalBranch('feature');
		writeFileSync(join(repoDir, 'file.txt'), 'feature');
		await git.add('.');
		await git.commit('feature change');

		await git.checkout('main');
		writeFileSync(join(repoDir, 'file.txt'), 'main');
		await git.add('.');
		await git.commit('main change');

		try {
			await git.merge(['feature']);
		} catch {
			// empty
		}

		writeRepoRecord(tempDir, 'Conflict', 'git@example.com:conflict.git');
		writeCheckoutRecord(tempDir, 'Conflict', 'Conflict', 'conflict');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual(['merge conflicts', 'uncommitted files', '1 commit ahead']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('reports "unknown project" for a checkout with missing repo record', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'orphan');
		await initWorkingRepo(repoDir, bareDir);

		writeCheckoutRecord(tempDir, 'Orphan', 'Orphan', 'orphan');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].issues).toEqual(['unknown project']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows extraneous directories in the Extraneous Report', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'orphan');
		await initWorkingRepo(repoDir, bareDir);
		await commitFile(repoDir, 'file.txt');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].exists).toEqual(true);
		expect(checkouts[0].extraneous).toEqual(true);

		const extraenous = ctx.store.getExtraneous();
		expect(extraenous.length).toEqual(1);
		expect(extraenous[0].exists).toEqual(true);
		expect(extraenous[0].extraneous).toEqual(true);
	});

	it('presents workspace report before checkout report', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'test');
		await initWorkingRepo(repoDir, bareDir);

		writeRepoRecord(tempDir, 'Test', 'git@example.com:test.git');
		writeCheckoutRecord(tempDir, 'Test', 'Test', 'test');

		const calls: string[] = [];
		vi.spyOn(console, 'info').mockImplementation((msg: string) => {
			if (msg === 'Workspace:' || msg === 'Checkouts:') {
				calls.push(msg);
			}
		});

		await runSanity(ctx, { auto: false });

		expect(calls[0]).toEqual('Workspace:');
		expect(calls[1]).toEqual('Checkouts:');

		vi.restoreAllMocks();
	});
});
