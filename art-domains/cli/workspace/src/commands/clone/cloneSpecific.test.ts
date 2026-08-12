import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { cloneSpecific } from './cloneSpecific';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('cloneSpecific', () => {
	it('unknown repo logs failure containing unknown repo', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const spy = vi.spyOn(ctx.log, 'log');

		await cloneSpecific(ctx, [], 'nope');

		expect(spy).toHaveBeenCalledTimes(1);
		const op = spy.mock.calls[0][0];
		expect(op.message()).toContain('unknown repo "nope"');
	});
});
