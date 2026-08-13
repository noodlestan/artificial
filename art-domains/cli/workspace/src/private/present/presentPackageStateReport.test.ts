import { afterEach, beforeEach, describe, it, vi } from 'vitest';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('presentPackageStateReport', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
	});

	it.todo('presents a table with package, version, published, and states columns');
	it.todo('handles empty package states');
	it.todo('shows "no package.json" state');
	it.todo('shows "npm info failed" state');
});
