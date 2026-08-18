import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { createCheckout } from '../../store/createCheckout';

import { createPullSuccess } from './createPullSuccess';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createPullSuccess', () => {
	it('message() contains the branch', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const success = createPullSuccess(checkout, 'main');
		expect(success.message()).toContain('main');
	});

	it('has correct operation and outcome', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const success = createPullSuccess(checkout, 'feat/x');
		expect(success.operation).toBe('pull');
		expect(success.outcome).toBe('success');
		expect(success.branch).toBe('feat/x');
	});
});
