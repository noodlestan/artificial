import { describe, expect, it } from 'vitest';

import { doesIssueBlockPush } from './doesIssueBlockPush';

describe('doesIssueBlockPush', () => {
	it('returns true for merge conflicts', () => {
		expect(doesIssueBlockPush('merge conflicts')).toBe(true);
	});

	it('returns false for a clean string', () => {
		expect(doesIssueBlockPush('all good')).toBe(false);
	});
});
