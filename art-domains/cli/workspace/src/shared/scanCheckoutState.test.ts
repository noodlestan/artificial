import { afterEach, describe, expect, it } from 'vitest';

import { createCheckout } from '../private/store/createCheckout';
import { createCommandContext } from '../test/createCommandContext';
import { makeTempDir } from '../test/makeTempDir';
import { removeTempDirs } from '../test/removeTempDirs';

import { scanCheckoutState } from './scanCheckoutState';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanCheckoutState', () => {
	it('missing dir returns exists: false and issues: not cloned', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'nope');

		const result = await scanCheckoutState(ctx, checkout);

		expect(result.exists).toBe(false);
		expect(result.issues).toContain('not cloned');
	});
});
