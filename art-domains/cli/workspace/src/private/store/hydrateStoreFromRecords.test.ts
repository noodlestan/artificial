import { join } from 'node:path';

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
				filename: join(tempDir, 'ops/records/checkouts/alpha.art'),
			},
			{
				repo: { name: 'Beta', remote: 'git@example.com:beta.git' },
				checkout: { name: 'Beta', location: 'beta', branch: 'develop' },
				filename: join(tempDir, 'ops/records/checkouts/beta.art'),
			},
		];

		hydrateStoreFromRecords(config, store, records);

		expect(store.getAllCheckouts()).toHaveLength(2);
		expect(store.getCheckoutForLocation('alpha')).toBeDefined();
		expect(store.getCheckoutForLocation('beta')).toBeDefined();
		expect(store.getCheckoutForLocation('beta')?.record.branch).toBe('develop');
	});

	it('copies filename from record into checkout', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const store = createCheckoutStore();
		const filename = join(tempDir, 'ops/records/checkouts/foo.art');
		const records = [
			{
				repo: { name: 'Foo', remote: 'git@example.com:foo.git' },
				checkout: { name: 'Foo', location: 'foo', branch: 'main' },
				filename,
			},
		];

		hydrateStoreFromRecords(config, store, records);

		const checkout = store.getCheckoutForLocation('foo');
		expect(checkout).toBeDefined();
		expect(checkout?.filename).toBe(filename);
	});

	it('new checkouts created via hydrate carry the source filename', () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const store = createCheckoutStore();
		const records = [
			{
				checkout: { name: 'Orphan', location: 'orphan', branch: 'main' },
				filename: join(tempDir, 'ops/records/checkouts/orphan.art'),
			},
		];

		hydrateStoreFromRecords(config, store, records);

		const checkout = store.getCheckoutForLocation('orphan');
		expect(checkout).toBeDefined();
		expect(checkout?.repo).toBeUndefined();
		expect(checkout?.filename).toBe(join(tempDir, 'ops/records/checkouts/orphan.art'));
	});
});
