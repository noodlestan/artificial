import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { pushCleanCheckouts } from './pushCleanCheckouts';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('pushCleanCheckouts', () => {
	it('no-op when the store has no checkouts', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await pushCleanCheckouts(ctx);

		expect(ctx.log.all()).toHaveLength(0);
	});
});
