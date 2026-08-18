import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFileTest } from '../../test/helpers/git/commitFileTest';
import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { hasLocalBranch } from './hasLocalBranch';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hasLocalBranch', () => {
	it('returns true when the branch exists locally', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		const git = simpleGit(dir);
		await commitFileTest(dir, 'file.txt');
		await git.checkoutLocalBranch('feature');

		const exists = await hasLocalBranch(dir, 'feature');

		expect(exists).toBe(true);
	});

	it('returns false when the branch does not exist locally', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);

		const exists = await hasLocalBranch(dir, 'nonexistent');

		expect(exists).toBe(false);
	});
});
