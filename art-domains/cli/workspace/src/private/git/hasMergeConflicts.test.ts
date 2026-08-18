import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { hasMergeConflicts } from './hasMergeConflicts';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hasMergeConflicts', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);

		const conflicts = await hasMergeConflicts(dir);

		expect(conflicts).toBe(false);
	});
});
