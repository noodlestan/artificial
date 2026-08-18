import { afterEach, describe, expect, it } from 'vitest';

import { makeMockConfig } from '../../test/helpers/context/makeMockConfig';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { createCheckoutStore } from './createCheckoutStore';
import { hydrateStoreFromRecords } from './hydrateStoreFromRecords';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('hydrateStoreFromRecords', () => {
	it('populates the store with a checkout per record', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const store = createCheckoutStore();
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

		hydrateStoreFromRecords(config, store, records);

		expect(store.getAllCheckouts()).toHaveLength(2);
		expect(store.getCheckoutForLocation('alpha')).toBeDefined();
		expect(store.getCheckoutForLocation('beta')).toBeDefined();
		expect(store.getCheckoutForLocation('beta')?.record.branch).toBe('develop');
	});
});
