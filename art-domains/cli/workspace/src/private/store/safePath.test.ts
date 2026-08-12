import { describe, expect, it } from 'vitest';

import { safePath } from './safePath';

describe('safePath', () => {
	it('lowercases and replaces non-alphanumerics with hyphens', () => {
		expect(safePath('Hello World!')).toBe('hello-world-');
	});

	it('collapses consecutive hyphens', () => {
		expect(safePath('foo___bar')).toBe('foo-bar');
	});
});
