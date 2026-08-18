import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFileTest } from '../../test/helpers/git/commitFileTest';
import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { getUnpushedCount } from './getUnpushedCount';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('getUnpushedCount', () => {
	it('returns the count of local commits for a branch with no remote counterpart', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		await commitFileTest(dir, 'file.txt');

		const count = await getUnpushedCount(dir, null);

		expect(count).toBe(1);
	});

	it('returns commits ahead of the remote branch', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		await commitFileTest(dir, 'file.txt');
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
