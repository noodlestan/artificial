import { existsSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { makeMockScan } from '../../../test/helpers/checkout/makeMockScan';
import { makeWorkspaceCheckoutMock } from '../../../test/helpers/checkout/makeWorkspaceCheckoutMock';
import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { commitFileTest } from '../../../test/helpers/git/commitFileTest';
import { initWorkingRepoTest } from '../../../test/helpers/git/initWorkingRepoTest';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { pullWorkspaceCheckout } from './pullWorkspaceCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('pullWorkspaceCheckout', () => {
	it('pulls the workspace root when clean and behind', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
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

		const ctx = createMockCommandContext(
			tempDir,
			makeWorkspaceCheckoutMock(tempDir, { scan: makeMockScan(1) }),
		);

		await pullWorkspaceCheckout(ctx);

		expect(ctx.workspace).toBeDefined();
		expect(ctx.workspace?.scan?.state('sync').behind).toEqual(0);
		expect(ctx.workspace?.scan?.issues()).not.toContain('1 commit behind');
		expect(existsSync(join(tempDir, 'origin-advance.txt'))).toEqual(true);
		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toEqual('pull');
		expect(ops[0].outcome).toEqual('success');
	});

	it('skips when the workspace is up to date', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(
			tempDir,
			makeWorkspaceCheckoutMock(tempDir, {
				scan: makeMockScan(0),
			}),
		);

		await pullWorkspaceCheckout(ctx);

		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips when the workspace is dirty', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(
			tempDir,
			makeWorkspaceCheckoutMock(tempDir, {
				scan: makeMockScan(1, true),
			}),
		);

		await pullWorkspaceCheckout(ctx);

		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips when there is no workspace checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await expect(pullWorkspaceCheckout(ctx)).resolves.toBeNull();
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('logs failure and continues when the pull fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
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

		await git.remote(['set-url', 'origin', join(tempDir, 'missing-origin')]);
		const ctx = createMockCommandContext(
			tempDir,
			makeWorkspaceCheckoutMock(tempDir, { scan: makeMockScan(1) }),
		);

		await expect(pullWorkspaceCheckout(ctx)).resolves.toBeNull();

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toEqual('pull');
		expect(ops[0].outcome).toEqual('failure');
	});
});
