import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { isDetachedHead } from './isDetachedHead';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('isDetachedHead', () => {
	it('returns false on a normal branch', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});

	it('returns false on error', async () => {
		const dir = makeTempDir(tempDirs);

		const detached = await isDetachedHead(dir);

		expect(detached).toBe(false);
	});
});
