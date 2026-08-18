/* eslint-disable no-console */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { commitFileTest } from '../../test/helpers/git/commitFileTest';
import { initWorkingRepoTest } from '../../test/helpers/git/initWorkingRepoTest';
import { writeCheckoutMockRecord } from '../../test/helpers/records/writeCheckoutMockRecord';
import { writeRepoMockRecord } from '../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { runSanity } from './runSanity';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

async function makeWorkspaceRootBehind(tempDir: string, bareDir: string): Promise<void> {
	await initWorkingRepoTest(tempDir, bareDir);
	const git = simpleGit(tempDir);
	await git.push('origin', 'main', ['--set-upstream']);

	const advDir = makeTempDir(tempDirs);
	await git.clone(bareDir, advDir);
	const advGit = simpleGit(advDir);
	await advGit.addConfig('user.email', 'test@example.com');
	await advGit.addConfig('user.name', 'Test');
	await commitFileTest(advDir, 'origin-advance.txt');
	await advGit.push('origin', 'main');

	await git.fetch('origin', 'main');
}

describe('sanity command', () => {
	it('reports "not cloned" for a missing checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		writeRepoMockRecord(tempDir, 'Foo Bar', 'git@example.com:foo-bar.git');
		writeCheckoutMockRecord(tempDir, 'Foo Bar', 'Foo Bar', 'foo-bar', 'ouch');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(false);
		expect(checkouts[0].scan?.issues()).toEqual(['not cloned']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows repo status when all repos are clean', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'green');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);

		writeRepoMockRecord(tempDir, 'Green', bareDir);
		writeCheckoutMockRecord(tempDir, 'Green', 'Green', 'green');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual([]);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows dirty repo with issues', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'dirty');
		await initWorkingRepoTest(repoDir, bareDir);
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoMockRecord(tempDir, 'Dirty', bareDir);
		writeCheckoutMockRecord(tempDir, 'Dirty', 'Dirty', 'dirty');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual(['uncommitted files']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows clean unpushed repo without --auto', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'unpushed');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt');

		writeRepoMockRecord(tempDir, 'Unpushed', bareDir);
		writeCheckoutMockRecord(tempDir, 'Unpushed', 'Unpushed', 'unpushed');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual(['1 commit ahead']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('pushes clean unpushed repo with --auto', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'autopush');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		await commitFileTest(repoDir, 'file2.txt');

		writeRepoMockRecord(tempDir, 'AutoPush', bareDir);
		writeCheckoutMockRecord(tempDir, 'AutoPush', 'AutoPush', 'autopush');

		await runSanity(ctx, { auto: true });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual([]);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(1);
		expect(ops[0].operation).toEqual('push');
		expect(ops[0].message()).toEqual('to origin/main');
	});

	it('does not push dirty repo with --auto', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'dirtynoauto');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeRepoMockRecord(tempDir, 'DirtyNoAuto', bareDir);
		writeCheckoutMockRecord(tempDir, 'DirtyNoAuto', 'DirtyNoAuto', 'dirtynoauto');

		await runSanity(ctx, { auto: true });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual(['uncommitted files', '1 commit ahead']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('surfaces detached HEAD', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'detached');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		const headSha = await git.revparse(['HEAD']);
		await git.checkout(headSha.trim());

		writeRepoMockRecord(tempDir, 'Detached', bareDir);
		writeCheckoutMockRecord(tempDir, 'Detached', 'Detached', 'detached');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual(['detached HEAD']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('surfaces merge conflicts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'conflict');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt', 'base');
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

		writeRepoMockRecord(tempDir, 'Conflict', bareDir);
		writeCheckoutMockRecord(tempDir, 'Conflict', 'Conflict', 'conflict');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual([
			'merge conflicts',
			'uncommitted files',
			'1 commit ahead',
		]);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('reports "unknown project" for a checkout with missing repo record', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'orphan');
		await initWorkingRepoTest(repoDir, bareDir);

		writeCheckoutMockRecord(tempDir, 'Orphan', 'Orphan', 'orphan');

		await runSanity(ctx, { auto: false });

		const checkouts = ctx.store.getAllCheckouts();
		expect(checkouts.length).toEqual(1);
		expect(checkouts[0].scan?.state('exists').exists).toEqual(true);
		expect(checkouts[0].scan?.issues()).toEqual(['unknown project']);
		const ops = ctx.log.all();
		expect(ops.length).toEqual(0);
	});

	it('shows extraneous directories in the Extraneous Report', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'orphan');
		await initWorkingRepoTest(repoDir, bareDir);
		await commitFileTest(repoDir, 'file.txt');

		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

		await runSanity(ctx, { auto: false });

		const output = spy.mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('Untracked:');
		expect(output).toContain('orphan');

		vi.restoreAllMocks();
	});

	it('presents workspace report before checkout report', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);

		const repoDir = join(tempDir, ctx.config.clone.path, 'test');
		await initWorkingRepoTest(repoDir, bareDir);

		writeRepoMockRecord(tempDir, 'Test', 'git@example.com:test.git');
		writeCheckoutMockRecord(tempDir, 'Test', 'Test', 'test');

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

	it('detects the workspace root is behind origin', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);
		await makeWorkspaceRootBehind(tempDir, bareDir);

		await runSanity(ctx, { auto: false });

		expect(ctx.workspace).toBeDefined();
		expect(ctx.workspace?.scan?.state('sync').behind).toEqual(1);
		expect(ctx.workspace?.scan?.issues()).toContain('1 commit behind');
	});

	it('pulls the workspace root with --auto when behind and clean', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);
		await makeWorkspaceRootBehind(tempDir, bareDir);

		await runSanity(ctx, { auto: true });

		expect(ctx.workspace).toBeDefined();
		expect(ctx.workspace?.scan?.state('sync').behind).toEqual(0);
		expect(existsSync(join(tempDir, 'origin-advance.txt'))).toEqual(true);
		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toEqual('pull');
		expect(ops[0].outcome).toEqual('success');
	});

	it('does not pull the workspace root with --auto when dirty', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);
		await makeWorkspaceRootBehind(tempDir, bareDir);
		writeFileSync(join(tempDir, 'dirty.txt'), 'dirty');

		await runSanity(ctx, { auto: true });

		expect(ctx.workspace).toBeDefined();
		expect(ctx.workspace?.scan?.issues()).toContain('uncommitted files');
		expect(ctx.workspace?.scan?.issues()).toContain('1 commit behind');
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('logs failure and continues with other operations when the workspace pull fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		const ctx = await createMockCommandContext(tempDir);
		await makeWorkspaceRootBehind(tempDir, bareDir);

		const checkoutBare = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'autopush');
		await initWorkingRepoTest(repoDir, checkoutBare);
		await commitFileTest(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		await commitFileTest(repoDir, 'file2.txt');

		writeRepoMockRecord(tempDir, 'AutoPush', 'git@example.com:autopush.git');
		writeCheckoutMockRecord(tempDir, 'AutoPush', 'AutoPush', 'autopush');

		writeFileSync(join(tempDir, '.gitignore'), 'repos/\n');
		const rootGit = simpleGit(tempDir);
		await rootGit.add(['.gitignore', 'ops/']);
		await rootGit.commit('workspace records');

		await simpleGit(tempDir).remote(['set-url', 'origin', join(tempDir, 'missing-origin')]);

		await runSanity(ctx, { auto: true });

		const ops = ctx.log.all();
		expect(ops).toHaveLength(2);
		expect(ops[0].operation).toEqual('pull');
		expect(ops[0].outcome).toEqual('failure');
		expect(ops[1].operation).toEqual('push');
		expect(ops[1].outcome).toEqual('success');
	});
});
