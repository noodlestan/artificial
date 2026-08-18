import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { cloneAll } from './cloneAll';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('cloneAll', () => {
	it('no-op with an empty repos list', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await cloneAll(ctx, []);

		expect(ctx.store.getAllCheckouts()).toHaveLength(0);
	});
});
