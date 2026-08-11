import { describe, expect, it } from 'vitest';

import { createCheckout } from './checkout';

describe('createCheckout', () => {
	it('creates a checkout with default values', () => {
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };
		const checkout = createCheckout(repo, 'repos/test', 'main');

		expect(checkout.repo.name).toBe('Test');
		expect(checkout.record.location).toBe('repos/test');
		expect(checkout.record.branch).toBe('main');
		expect(checkout.exists).toBe(false);
		expect(checkout.issues).toEqual([]);
	});
});
