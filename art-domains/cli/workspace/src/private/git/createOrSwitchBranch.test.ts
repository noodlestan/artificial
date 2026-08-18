import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFileTest } from '../../test/helpers/git/commitFileTest';
import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { createOrSwitchBranch } from './createOrSwitchBranch';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createOrSwitchBranch', () => {
	it('creates a branch in a working repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		await commitFileTest(dir, 'file.txt');

		const result = await createOrSwitchBranch(dir, 'feat/x');

		expect(result).toBe('created');
		const git = simpleGit(dir);
		const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
		expect(branch.trim()).toBe('feat/x');
	});

	it('switches to an existing branch on second call', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		await commitFileTest(dir, 'file.txt');
		await createOrSwitchBranch(dir, 'feat/x');

		const result = await createOrSwitchBranch(dir, 'feat/x');

		expect(result).toBe('switched');
	});
});
