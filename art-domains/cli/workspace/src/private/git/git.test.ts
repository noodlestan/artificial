import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { getCurrentBranch } from './get-current-branch';
import { isDetachedHead } from './is-detached-head';
import { hasMergeConflicts } from './has-merge-conflicts';
import { isDirty } from './is-dirty';
import { hasRemote } from './has-remote';
import { getUnpushedCount } from './get-unpushed-count';

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

describe('getUnpushedCount', () => {
	it('returns -1 for branch with no tracking', async () => {
		const dir = makeTempDir();
		await initGitRepo(dir);

		const count = await getUnpushedCount(dir);

		expect(count).toBe(-1);
	});
});
