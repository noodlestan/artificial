import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { createCheckout } from '../store/createCheckout';

import { createCloneFailure } from './createCloneFailure';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('createCloneFailure', () => {
	it('message() contains the repo name', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const failure = createCloneFailure(checkout, 'permission denied');
		expect(failure.message()).toContain('MyRepo');
	});

	it('errorSerialized() contains CloneError', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		const failure = createCloneFailure(checkout, new Error('boom'));
		expect(failure.errorSerialized()).toContain('CloneError');
	});
});
