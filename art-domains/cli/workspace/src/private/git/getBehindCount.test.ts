import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFileTest } from '../../test/helpers/git/commitFileTest';
import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { getBehindCount } from './getBehindCount';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('getBehindCount', () => {
	it('returns the count of commits behind the remote branch', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		const bareDir = makeTempDir(tempDirs);
		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);
		const git = simpleGit(dir);
		await git.addRemote('origin', bareDir);
		await commitFileTest(dir, 'file.txt');
		await git.push('origin', 'main', ['--set-upstream']);

		const otherDir = makeTempDir(tempDirs);
		await simpleGit(otherDir).clone(bareDir, otherDir);
		const otherGit = simpleGit(otherDir);
		await otherGit.addConfig('user.email', 'test@example.com');
		await otherGit.addConfig('user.name', 'Test');
		writeFileSync(join(otherDir, 'origin.txt'), 'origin');
		await otherGit.add('.');
		await otherGit.commit('origin change');
		await otherGit.push('origin', 'main');

		await git.fetch('origin', 'main');

		const count = await getBehindCount(dir, 'origin/main');

		expect(count).toBe(1);
	});

	it('returns 0 when up to date with the remote', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		const bareDir = makeTempDir(tempDirs);
		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);
		const git = simpleGit(dir);
		await git.addRemote('origin', bareDir);
		await commitFileTest(dir, 'file.txt');
		await git.push('origin', 'main', ['--set-upstream']);

		const count = await getBehindCount(dir, 'origin/main');

		expect(count).toBe(0);
	});

	it('returns 0 when the command fails', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		await commitFileTest(dir, 'file.txt');

		const count = await getBehindCount(dir, 'origin/main');

		expect(count).toBe(0);
	});
});
