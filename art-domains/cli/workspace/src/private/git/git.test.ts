import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFile } from '../../test/commit-file';
import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { getCurrentBranch } from './getCurrentBranch';
import { getRemoteBranch } from './getRemoteBranch';
import { getUnpushedCount } from './getUnpushedCount';
import { hasRemote } from './has-remote';
import { hasLocalBranch } from './hasLocalBranch';
import { hasMergeConflicts } from './hasMergeConflicts';
import { isDirty } from './is-dirty';
import { isDetachedHead } from './isDetachedHead';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('getCurrentBranch', () => {
	it('returns the current branch name', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		const git = simpleGit(dir);
		await git.checkoutLocalBranch('feature');

		const branch = await getCurrentBranch(dir);

		expect(branch).toBe('feature');
	});

	it('returns - on error', async () => {
		const dir = makeTempDir(tempDirs);

		const branch = await getCurrentBranch(dir);

		expect(branch).toBe('-');
	});
});

describe('isDetachedHead', () => {
	it('returns false on a normal branch', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});

	it('returns false on error', async () => {
		const dir = makeTempDir(tempDirs);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});
});

describe('hasMergeConflicts', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const conflicts = await hasMergeConflicts(dir);

		expect(conflicts).toBe(false);
	});
});

describe.only('hasLocalBranch', () => {
	it('returns true when the branch exists locally', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		const git = simpleGit(dir);
		await commitFile(dir, 'file.txt');
		await git.checkoutLocalBranch('feature');

		const exists = await hasLocalBranch(dir, 'feature');

		expect(exists).toBe(true);
	});

	it('returns false when the branch does not exist locally', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const exists = await hasLocalBranch(dir, 'nonexistent');

		expect(exists).toBe(false);
	});
});

describe('isDirty', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const dirty = await isDirty(dir);

		expect(dirty).toBe(false);
	});

	it('returns true for dirty repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		writeFileSync(join(dir, 'new.txt'), 'new');

		const dirty = await isDirty(dir);

		expect(dirty).toBe(true);
	});
});

describe('hasRemote', () => {
	it('returns false for repo with no remote', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const remote = await hasRemote(dir);

		expect(remote).toBe(false);
	});
});

describe('getRemoteBranch', () => {
	it('returns null when the branch has no remote counterpart', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const remote = await getRemoteBranch(dir);

		expect(remote).toBeNull();
	});

	it('returns the remote branch name when it exists on origin', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		const bareDir = makeTempDir(tempDirs);
		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);
		const git = simpleGit(dir);
		await git.addRemote('origin', bareDir);
		await git.push('origin', 'main', ['--set-upstream']);

		const remote = await getRemoteBranch(dir);

		expect(remote).toBe('origin/main');
	});
});

describe('getUnpushedCount', () => {
	it('returns the count of local commits for a branch with no remote counterpart', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const count = await getUnpushedCount(dir, null);

		expect(count).toBe(1);
	});

	it('returns commits ahead of the remote branch', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		const bareDir = makeTempDir(tempDirs);
		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);
		const git = simpleGit(dir);
		await git.addRemote('origin', bareDir);
		await git.push('origin', 'main', ['--set-upstream']);
		writeFileSync(join(dir, 'second.txt'), 'second');
		await git.add('.');
		await git.commit('second');

		const count = await getUnpushedCount(dir, 'origin/main');

		expect(count).toBe(1);
	});
});
