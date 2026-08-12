import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCheckoutStore } from '../store/createCheckoutStore';

import { presentExtraneousReport } from './presentExtraneousReport';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('presentExtraneousReport', () => {
	it('no output when no extraneous checkouts', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const store = createCheckoutStore();

		presentExtraneousReport(store);

		expect(spy).not.toHaveBeenCalled();
	});

	it('prints Untracked: when extraneous exist', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const store = createCheckoutStore();
		const config = {
			clone: { path: 'repos' },
			root: { path: '.' },
			records: { repositories: { path: '' }, checkouts: { path: '', template: '' } },
		};
		store.markExtraneous(config, 'orphan');

		presentExtraneousReport(store);

		expect(spy).toHaveBeenCalledWith('Untracked:');
	});
});
