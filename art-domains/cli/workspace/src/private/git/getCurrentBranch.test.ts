import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { getCurrentBranch } from './getCurrentBranch';

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
