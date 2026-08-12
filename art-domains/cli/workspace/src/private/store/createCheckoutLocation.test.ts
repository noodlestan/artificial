import { describe, expect, it } from 'vitest';

import { createCheckoutLocation } from './createCheckoutLocation';

describe('createCheckoutLocation', () => {
	it('sanitizes repo name with safePath', () => {
		const repo = { name: 'My Repo', remote: 'git@example.com:my-repo.git' };
		expect(createCheckoutLocation(repo)).toBe('my-repo');
	});

	it('combines repo name and target', () => {
		const repo = { name: 'My Repo', remote: 'git@example.com:my-repo.git' };
		expect(createCheckoutLocation(repo, 'fix-x')).toBe('my-repo-fix-x');
	});
});
