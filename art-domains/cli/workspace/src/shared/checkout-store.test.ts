import { describe, expect, it } from 'vitest';

import { createCheckoutStore } from './checkout-store';

function makeConfig() {
	return {
		clone: { path: 'repos' },
		records: {
			repositories: { path: 'ops/records/repositories' },
			checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },
		},
	};
}

describe('createCheckoutStore', () => {
	it('adds and retrieves a checkout', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };

		store.addCheckout(repo, 'repos/test');

		const checkout = store.getCheckout('test');
		expect(checkout).toBeDefined();
		expect(checkout?.repo.name).toBe('Test');
	});

	it('findCheckout is case-insensitive', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };

		store.addCheckout(repo, 'repos/test');

		expect(store.findCheckout('TEST')).toBeDefined();
		expect(store.findCheckout('Test')).toBeDefined();
		expect(store.findCheckout('test')).toBeDefined();
	});

	it('findCheckout strips package scope', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'test', remote: 'git@example.com:test.git' };

		store.addCheckout(repo, 'repos/test');

		expect(store.findCheckout('@scope/test')).toBeDefined();
	});

	it('setCheckout replaces existing checkout', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };
		const checkout = store.addCheckout(repo, 'repos/test');

		const updated = { ...checkout, exists: true };
		store.setCheckout(updated);

		expect(store.getCheckout('test')?.exists).toBe(true);
	});

	it('getExtraneous returns only extraneous checkouts', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };
		store.addCheckout(repo, 'repos/test');
		store.markExtraneous('repos/extras');

		const extraneous = store.getExtraneous();
		expect(extraneous).toHaveLength(1);
		expect(extraneous[0].extraneous).toBe(true);
	});
});
