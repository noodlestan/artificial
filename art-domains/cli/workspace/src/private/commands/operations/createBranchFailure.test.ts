import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { createCheckout } from '../../store/createCheckout';

import { createBranchFailure } from './createBranchFailure';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createBranchFailure', () => {
	it('factory defaults and serialization', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		const checkout = createCheckout(
			ctx.config,
			'bug-fix',
			{ name: 'One', remote: 'git@example.com:one.git' },
			'main',
		);

		const failure = createBranchFailure('feat/x', new Error('boom (reason)'), checkout);
		expect(failure.errorSerialized()).toContain('boom');
		expect(failure.errorSerialized()).toContain('reason');
	});
});
