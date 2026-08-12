import { describe, expect, it } from 'vitest';

import { makeConfig } from '../../test/make-config';

import { createCheckoutStore } from './checkout-store';
import { createCheckout } from './create-checkout';

describe('createCheckoutStore', () => {
	it('addCheckout stores the provided checkout', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c = createCheckout(config, 'fix-test', repo);

		store.addCheckout(c);

		const checkout = store.getAllCheckouts()[0];
		expect(checkout).toBeDefined();
		expect(checkout?.repo).toBe(repo);
		expect(checkout?.record.name).toBe('Foo Bar @fix-test');
		expect(checkout?.record.location).toBe('fix-test');
	});

	it('addCheckout rejects duplicate checkouts', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c1 = createCheckout(config, 'fix-test', repo, undefined, 'one');
		store.addCheckout(c1);

		const c2 = createCheckout(config, 'fix-test', repo, undefined, 'two');
		store.addCheckout(c2);

		const checkouts = store.getAllCheckouts();
		expect(checkouts.length).toBe(1);
		expect(checkouts[0]).toBeDefined();
		expect(checkouts[0]?.repo).toBe(repo);
		expect(checkouts[0]?.record.name).toBe('one');
	});

	it('getCheckoutByName', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };

		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);

		const checkout = store.getCheckoutByName('Foo Bar @fix-test');
		expect(checkout).toBeDefined();
		expect(checkout?.repo?.name).toBe('Foo Bar');
	});

	it('getCheckoutForLocation', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };

		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);

		const checkout = store.getCheckoutForLocation('fix-test');
		expect(checkout).toBeDefined();
		expect(checkout?.repo?.name).toBe('Foo Bar');
	});

	it('getCheckoutOfRepo is case-insensitive', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };

		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);

		expect(store.getCheckoutOfRepo('FOO BAR')).toBeDefined();
		expect(store.getCheckoutOfRepo('foo bar')).toBeDefined();
	});

	it('updateCheckout replaces existing checkout', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);

		const updated = { ...c, exists: true };
		store.updateCheckout(updated);

		expect(store.getAllCheckouts().length).toBe(1);
		expect(store.getCheckoutForLocation('fix-test')).toBeDefined();
	});

	it('updateCheckout replaces by location', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c1 = createCheckout(config, 'fix-test', repo, undefined, 'one');
		store.addCheckout(c1);

		const c2 = createCheckout(config, 'fix-test', repo, undefined, 'two');
		store.updateCheckout(c2);

		const checkouts = store.getAllCheckouts();
		expect(checkouts.length).toBe(1);
		expect(checkouts[0].record.name).toBe('two');
		expect(checkouts[0].record.location).toBe('fix-test');
	});

	it('markExtraneous marks existing checkout as extraenous', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);
		store.markExtraneous(config, 'fix-test');

		const checkouts = store.getAllCheckouts();

		expect(checkouts).toHaveLength(1);
		expect(checkouts[0].extraneous).toBe(true);
		expect(checkouts[0].record.name).toBe('Foo Bar @fix-test');
	});

	it('markExtraneous creates new checkout when location is new', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);
		store.markExtraneous(config, 'extras');

		const checkouts = store.getAllCheckouts();
		expect(checkouts).toHaveLength(2);
		expect(checkouts[0].extraneous).toBe(false);
		expect(checkouts[1].extraneous).toBe(true);
		expect(checkouts[1].record.location).toBe('extras');
		expect(checkouts[1].record.name).toBe('extras');
	});

	it('getExtraneous returns only extraneous checkouts', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const repo = { name: 'Foo Bar', remote: 'git@example.com:test.git' };
		const c = createCheckout(config, 'fix-test', repo);
		store.addCheckout(c);
		store.markExtraneous(config, 'extras');

		const checkouts = store.getAllCheckouts();
		expect(checkouts).toHaveLength(2);
		const extraneous = store.getExtraneous();
		expect(extraneous).toHaveLength(1);
		expect(extraneous[0].extraneous).toBe(true);
		expect(extraneous[0].record.name).toBe('extras');
	});
});
