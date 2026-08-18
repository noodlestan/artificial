import { describe, expect, it } from 'vitest';

import { makeMockConfig } from '../../test/helpers/context/makeMockConfig';

import { createCheckout } from './createCheckout';

describe('createCheckout', () => {
	it('factory defaults', () => {
		const config = makeMockConfig('.');
		const checkout = createCheckout(config, 'target');

		expect(checkout.path).toBe('repos/target');
		expect(checkout.repo).toBe(undefined);
		expect(checkout.record.repository).toBe(undefined);
		expect(checkout.record.name).toBe('target');
		expect(checkout.record.location).toBe('target');
		expect(checkout.record.branch).toBe('main');
	});

	it('creates a checkout based on repo', () => {
		const config = makeMockConfig('.');
		const repo = { name: 'Foo Bar', remote: 'git@example.com:foo-bar.git' };
		const checkout = createCheckout(config, 'fix-test', repo);

		expect(checkout.path).toBe('repos/fix-test');
		expect(checkout.repo).toBe(repo);
		expect(checkout.record.repository).toBe('Foo Bar');
		expect(checkout.record.name).toBe('Foo Bar @fix-test');
		expect(checkout.record.location).toBe('fix-test');
		expect(checkout.record.branch).toBe('main');
	});

	it('creates a checkout with a branch', () => {
		const config = makeMockConfig('.');
		const repo = { name: 'Foo Bar', remote: 'git@example.com:foo-bar.git' };
		const checkout = createCheckout(config, 'fix-test', repo, 'branch-name');

		expect(checkout.path).toBe('repos/fix-test');
		expect(checkout.record.name).toBe('Foo Bar @fix-test');
		expect(checkout.record.location).toBe('fix-test');
		expect(checkout.record.branch).toBe('branch-name');
	});

	it('creates a checkout based on repo, target, and custom name', () => {
		const config = makeMockConfig('.');
		const repo = { name: 'Foo Bar', remote: 'git@example.com:foo-bar.git' };
		const checkout = createCheckout(config, 'fix-test', repo, undefined, 'Checkout Name');

		expect(checkout.path).toBe('repos/fix-test');
		expect(checkout.repo).toBe(repo);
		expect(checkout.record.name).toBe('Checkout Name');
		expect(checkout.record.location).toBe('fix-test');
		expect(checkout.record.branch).toBe('main');
	});
});
