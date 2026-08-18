import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';
import { createCheckout } from '../store/createCheckout';

import { scanCheckoutState } from './scanCheckoutState';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanCheckoutState', () => {
	it('missing dir returns an exists state and a not-cloned issue', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'nope');

		const result = await scanCheckoutState(checkout);

		expect(result.scan?.state('exists')).toEqual({ type: 'exists', exists: false });
		expect(result.scan?.issues()).toContain('not cloned');
		expect(result.scan?.can('clone')).toBe(true);
		expect(result.scan?.should('clone')).toBe(true);
	});
});
