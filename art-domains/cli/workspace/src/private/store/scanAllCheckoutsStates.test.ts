import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { scanAllCheckoutsStates } from './scanAllCheckoutsStates';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanAllCheckoutsStates', () => {
	it('no-op on an empty store', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await scanAllCheckoutsStates(ctx.store);

		expect(ctx.store.getAllCheckouts()).toHaveLength(0);
	});
});
