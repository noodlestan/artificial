import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { cloneStatus } from './cloneStatus';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('cloneStatus', () => {
	it('runs without error on an empty store', async () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await cloneStatus(ctx);

		expect(spy).toHaveBeenCalled();
	});
});
