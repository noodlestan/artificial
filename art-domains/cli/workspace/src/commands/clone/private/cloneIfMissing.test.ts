import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCheckout } from '../../../private/store/createCheckout';
import { createCommandContext } from '../../../test/createCommandContext';
import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';

import { cloneIfMissing } from './cloneIfMissing';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('cloneIfMissing', () => {
	it('checkout without a repo returns null', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'orphan');

		const result = await cloneIfMissing(ctx, checkout);

		expect(result).toBeNull();
	});
});
