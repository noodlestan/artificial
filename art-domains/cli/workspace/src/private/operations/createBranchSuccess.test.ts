import { afterEach, describe, expect, it } from 'vitest';

import { createCheckout } from '../../private/store/createCheckout';
import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { createBranchSuccess } from './createBranchSuccess';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createBranchSuccess', () => {
	it('factory defaults and serialization', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const checkout = createCheckout(
			ctx.config,
			'bug-fix',
			{ name: 'One', remote: 'git@example.com:one.git' },
			'main',
		);

		const success = createBranchSuccess(checkout, 'feat/x');
		expect(success.message()).toBe('<empty>');
	});
});
