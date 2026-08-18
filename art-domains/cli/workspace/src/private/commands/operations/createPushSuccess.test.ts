import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { createCheckout } from '../../store/createCheckout';

import { createPushSuccess } from './createPushSuccess';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createPushSuccess', () => {
	it('message() is to origin/branch', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const success = createPushSuccess(checkout, 'main');
		expect(success.message()).toBe('to origin/main');
	});
});
