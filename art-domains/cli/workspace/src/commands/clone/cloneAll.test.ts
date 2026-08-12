import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { cloneAll } from './cloneAll';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('cloneAll', () => {
	it('no-op with an empty repos list', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		await cloneAll(ctx, []);

		expect(ctx.store.getAllCheckouts()).toHaveLength(0);
	});
});
