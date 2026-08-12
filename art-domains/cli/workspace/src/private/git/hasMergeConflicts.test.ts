import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { hasMergeConflicts } from './hasMergeConflicts';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hasMergeConflicts', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const conflicts = await hasMergeConflicts(dir);

		expect(conflicts).toBe(false);
	});
});
