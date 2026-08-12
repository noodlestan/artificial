import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../../test/createCommandContext';
import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';

import { pushCleanCheckouts } from './pushCleanCheckouts';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('pushCleanCheckouts', () => {
	it('no-op when the store has no checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		await pushCleanCheckouts(ctx);

		expect(ctx.log.all()).toHaveLength(0);
	});
});
