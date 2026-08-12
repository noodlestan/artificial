import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { isDirty } from './is-dirty';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('isDirty', () => {
	it('returns false for clean repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);

		const dirty = await isDirty(dir);

		expect(dirty).toBe(false);
	});

	it('returns true for dirty repo', async () => {
		const dir = makeTempDir(tempDirs);
		await initGitRepo(dir);
		writeFileSync(join(dir, 'new.txt'), 'new');

		const dirty = await isDirty(dir);

		expect(dirty).toBe(true);
	});
});
