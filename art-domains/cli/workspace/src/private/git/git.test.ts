import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { getCurrentBranch } from './get-current-branch';
import { getRemoteBranch } from './get-remote-branch';
import { getUnpushedCount } from './get-unpushed-count';
import { hasLocalBranch } from './has-local-branch';
import { hasMergeConflicts } from './has-merge-conflicts';
import { hasRemote } from './has-remote';
import { isDetachedHead } from './is-detached-head';
import { isDirty } from './is-dirty';

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-git-test-'));
	tempDirs.push(dir);
	return dir;
}

async function initGitRepo(dir: string): Promise<void> {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init();
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	writeFileSync(join(dir, 'file.txt'), 'initial');
	await git.add('.');
	await git.commit('initial');
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe('getCurrentBranch', () => {
	it('returns the current branch name', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);
		const git = simpleGit(dir);
		await git.checkoutLocalBranch('feature');

		const branch = await getCurrentBranch(dir);

		expect(branch).toBe('feature');
	});

	it('returns - on error', async () => {
		const dir = makeTempDir();

		const branch = await getCurrentBranch(dir);

		expect(branch).toBe('-');
	});
});

describe('isDetachedHead', () => {
	it('returns false on a normal branch', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});

	it('returns false on error', async () => {
		const dir = makeTempDir();

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});
});

describe('hasMergeConflicts', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const conflicts = await hasMergeConflicts(dir);

		expect(conflicts).toBe(false);
	});
});

describe('hasLocalBranch', () => {
	it('returns true when the branch exists locally', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);
		const git = simpleGit(dir);
		await git.checkoutLocalBranch('feature');

		const exists = await hasLocalBranch(dir, 'feature');

		expect(exists).toBe(true);
	});

	it('returns false when the branch does not exist locally', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const exists = await hasLocalBranch(dir, 'nonexistent');

		expect(exists).toBe(false);
	});
});

describe('isDirty', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const dirty = await isDirty(dir);

		expect(dirty).toBe(false);
	});

	it('returns true for dirty repo', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);
		writeFileSync(join(dir, 'new.txt'), 'new');

		const dirty = await isDirty(dir);

		expect(dirty).toBe(true);
	});
});

describe('hasRemote', () => {
	it('returns false for repo with no remote', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const remote = await hasRemote(dir);

		expect(remote).toBe(false);
	});
});

describe('getRemoteBranch', () => {
	it('returns null when the branch has no remote counterpart', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const remote = await getRemoteBranch(dir);

		expect(remote).toBeNull();
	});

	it('returns the remote branch name when it exists on origin', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);
		const bareDir = makeTempDir();
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
		const dir = makeTempDir();
		await initGitRepo(dir);

		const count = await getUnpushedCount(dir, null);

		expect(count).toBe(1);
	});

	it('returns commits ahead of the remote branch', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);
		const bareDir = makeTempDir();
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
