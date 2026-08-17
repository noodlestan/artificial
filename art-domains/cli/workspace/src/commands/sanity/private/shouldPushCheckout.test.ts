import { afterEach, describe, expect, it } from 'vitest';

import { createCheckout } from '../../../private/store/createCheckout';
import { createCommandContext } from '../../../test/createCommandContext';
import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';

import { shouldPushCheckout } from './shouldPushCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('shouldPushCheckout', () => {
	it('returns false when a blocking issue is present', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		checkout.scan = {
			exists: true,
			branch: 'main',
			remoteBranch: null,
			detached: false,
			conflicts: true,
			dirty: false,
			hasRemote: true,
			unpushed: 3,
			isBehind: false,
			issues: ['merge conflicts'],
		};

		expect(shouldPushCheckout(checkout)).toBe(false);
	});

	it('returns true for a clean checkout with unpushed commits', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		checkout.scan = {
			exists: true,
			branch: 'main',
			remoteBranch: null,
			detached: false,
			conflicts: false,
			dirty: false,
			hasRemote: true,
			unpushed: 2,
			isBehind: false,
			issues: [],
		};

		expect(shouldPushCheckout(checkout)).toBe(true);
	});
});
