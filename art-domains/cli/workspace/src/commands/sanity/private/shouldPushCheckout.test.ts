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
		checkout.exists = true;
		checkout.unpushed = 3;
		checkout.issues = ['merge conflicts'];

		expect(shouldPushCheckout(checkout)).toBe(false);
	});

	it('returns true for a clean checkout with unpushed commits', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		checkout.exists = true;
		checkout.unpushed = 2;

		expect(shouldPushCheckout(checkout)).toBe(true);
	});
});
