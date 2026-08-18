import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { hasRemote } from './hasRemote';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hasRemote', () => {
	it('returns false for repo with no remote', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);

		const remote = await hasRemote(dir);

		expect(remote).toBe(false);
	});
});
