import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { hasRemote } from './has-remote';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hasRemote', () => {
	it('returns false for repo with no remote', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const remote = await hasRemote(dir);

		expect(remote).toBe(false);
	});
});
