import { existsSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import type { Checkout } from '../../../private/store/createCheckout';
import { commitFile } from '../../../test/commitFile';
import { createCommandContext } from '../../../test/createCommandContext';
import { initWorkingRepo } from '../../../test/initWorkingRepo';
import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';

import { pullWorkspaceCheckout } from './pullWorkspaceCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

function makeWorkspaceCheckout(path: string, overrides?: Partial<Checkout>): Checkout {
	return {
		repo: undefined,
		record: { name: 'Workspace', location: '.', branch: 'main', repository: undefined },
		path,
		scan: {
			exists: true,
			branch: 'main',
			remoteBranch: 'origin/main',
			detached: false,
			conflicts: false,
			dirty: false,
			hasRemote: true,
			unpushed: 0,
			isBehind: true,
			issues: ['1 commit behind'],
		},
		...overrides,
	};
}

describe('pullWorkspaceCheckout', () => {
	it('pulls the workspace root when clean and behind', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		await initWorkingRepo(tempDir, bareDir);
		const git = simpleGit(tempDir);
		await git.push('origin', 'main', ['--set-upstream']);

		const advDir = makeTempDir(tempDirs);
		await git.clone(bareDir, advDir);
		const advGit = simpleGit(advDir);
		await advGit.addConfig('user.email', 'test@example.com');
		await advGit.addConfig('user.name', 'Test');
		await commitFile(advDir, 'origin-advance.txt');
		await advGit.push('origin', 'main');

		const ctx = createCommandContext(tempDir, makeWorkspaceCheckout(tempDir));

		await pullWorkspaceCheckout(ctx);

		expect(ctx.workspace).toBeDefined();
		expect(ctx.workspace?.scan?.isBehind).toEqual(false);
		expect(ctx.workspace?.scan?.issues).not.toContain('1 commit behind');
		expect(existsSync(join(tempDir, 'origin-advance.txt'))).toEqual(true);
		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toEqual('pull');
		expect(ops[0].outcome).toEqual('success');
	});

	it('skips when the workspace is up to date', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(
			tempDir,
			makeWorkspaceCheckout(tempDir, {
				scan: {
					exists: true,
					branch: 'main',
					remoteBranch: 'origin/main',
					detached: false,
					conflicts: false,
					dirty: false,
					hasRemote: true,
					unpushed: 0,
					isBehind: false,
					issues: [],
				},
			}),
		);

		await pullWorkspaceCheckout(ctx);

		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips when the workspace is dirty', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(
			tempDir,
			makeWorkspaceCheckout(tempDir, {
				scan: {
					exists: true,
					branch: 'main',
					remoteBranch: 'origin/main',
					detached: false,
					conflicts: false,
					dirty: true,
					hasRemote: true,
					unpushed: 0,
					isBehind: true,
					issues: ['1 commit behind'],
				},
			}),
		);

		await pullWorkspaceCheckout(ctx);

		expect(ctx.log.all()).toHaveLength(0);
	});

	it('skips when there is no workspace checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		await expect(pullWorkspaceCheckout(ctx)).resolves.toBeUndefined();
		expect(ctx.log.all()).toHaveLength(0);
	});

	it('logs failure and continues when the pull fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);
		await initWorkingRepo(tempDir, bareDir);
		const git = simpleGit(tempDir);
		await git.push('origin', 'main', ['--set-upstream']);

		const advDir = makeTempDir(tempDirs);
		await git.clone(bareDir, advDir);
		const advGit = simpleGit(advDir);
		await advGit.addConfig('user.email', 'test@example.com');
		await advGit.addConfig('user.name', 'Test');
		await commitFile(advDir, 'origin-advance.txt');
		await advGit.push('origin', 'main');

		await git.remote(['set-url', 'origin', join(tempDir, 'missing-origin')]);
		const ctx = createCommandContext(tempDir, makeWorkspaceCheckout(tempDir));

		await expect(pullWorkspaceCheckout(ctx)).resolves.toBeUndefined();

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toEqual('pull');
		expect(ops[0].outcome).toEqual('failure');
	});
});
