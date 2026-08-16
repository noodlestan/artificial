import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { scanAllCheckoutsStates } from './scanAllCheckoutsStates';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanAllCheckoutsStates', () => {
	it('no-op on an empty store', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		await scanAllCheckoutsStates(ctx.store);

		expect(ctx.store.getAllCheckouts()).toHaveLength(0);
	});
});
