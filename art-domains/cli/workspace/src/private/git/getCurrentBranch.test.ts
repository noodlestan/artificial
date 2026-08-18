import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { getCurrentBranch } from './getCurrentBranch';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('getCurrentBranch', () => {
	it('returns the current branch name', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
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
