import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { isDetachedHead } from './isDetachedHead';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('isDetachedHead', () => {
	it('returns false on a normal branch', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});

	it('returns false on error', async () => {
		const dir = makeTempDir(tempDirs);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});
});
