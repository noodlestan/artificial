import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { createCheckout } from '../../store/createCheckout';

import { createBranchSuccess } from './createBranchSuccess';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createBranchSuccess', () => {
	it('factory defaults and serialization', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

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
