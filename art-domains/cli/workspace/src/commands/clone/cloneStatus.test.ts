import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

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
		const ctx = createCommandContext(tempDir);

		await cloneStatus(ctx);

		expect(spy).toHaveBeenCalled();
	});
});
