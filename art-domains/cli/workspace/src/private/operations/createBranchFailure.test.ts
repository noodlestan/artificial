import { afterEach, describe, expect, it } from 'vitest';

import { createCheckout } from '../../private/store/create-checkout';
import { createCommandContext } from '../../test/create-command-context';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { createBranchFailure } from './createBranchFailure';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createBranchFailure', () => {
	it('factory defaults and serialization', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

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
