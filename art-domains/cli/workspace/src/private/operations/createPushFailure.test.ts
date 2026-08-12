import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { createCheckout } from '../store/createCheckout';

import { createPushFailure } from './createPushFailure';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createPushFailure', () => {
	it('message() extracts the reason', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const failure = createPushFailure(checkout, 'main', new Error('rejected (not allowed)'));
		expect(failure.message()).toBe('not allowed');
	});

	it('errorSerialized() contains PushError', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const failure = createPushFailure(checkout, 'main', new Error('boom'));
		expect(failure.errorSerialized()).toContain('PushError');
	});
});
