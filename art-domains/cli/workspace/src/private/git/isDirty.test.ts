import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { isDirty } from './isDirty';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('isDirty', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);

		const dirty = await isDirty(dir);

		expect(dirty).toBe(false);
	});

	it('returns true for dirty repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepoTest(dir);
		writeFileSync(join(dir, 'new.txt'), 'new');

		const dirty = await isDirty(dir);

		expect(dirty).toBe(true);
	});
});
