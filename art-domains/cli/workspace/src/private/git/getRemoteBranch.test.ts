import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFile } from '../../test/commitFile';
import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { getRemoteBranch } from './getRemoteBranch';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('getRemoteBranch', () => {
	it('returns null when the branch has no remote counterpart', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		await commitFile(dir, 'file.txt');

		const remote = await getRemoteBranch(dir);

		expect(remote).toBeNull();
	});

	it('returns the remote branch name when it exists on origin', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		await commitFile(dir, 'file.txt');
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
