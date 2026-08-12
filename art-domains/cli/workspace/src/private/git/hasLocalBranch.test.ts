import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFile } from '../../test/commitFile';
import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { hasLocalBranch } from './hasLocalBranch';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hasLocalBranch', () => {
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
