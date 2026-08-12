import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { hydrateStoreFromRecords } from './hydrateStoreFromRecords';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hydrateStoreFromRecords', () => {
	it('populates the store with a checkout per record', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const records = [
			{
				repo: { name: 'Alpha', remote: 'git@example.com:alpha.git' },
				checkout: { name: 'Alpha', location: 'alpha', branch: 'main' },
			},
			{
				repo: { name: 'Beta', remote: 'git@example.com:beta.git' },
				checkout: { name: 'Beta', location: 'beta', branch: 'develop' },
			},
		];

		hydrateStoreFromRecords(ctx, records);

		expect(ctx.store.getAllCheckouts()).toHaveLength(2);
		expect(ctx.store.getCheckoutForLocation('alpha')).toBeDefined();
		expect(ctx.store.getCheckoutForLocation('beta')).toBeDefined();
		expect(ctx.store.getCheckoutForLocation('beta')?.record.branch).toBe('develop');
	});
});
