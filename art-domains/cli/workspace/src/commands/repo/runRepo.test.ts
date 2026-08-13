import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { removeTempDirs } from '../../test/removeTempDirs';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('repo command', () => {
	it.todo("lists a single checkout's packages");
	it.todo('defaults to all checkouts when none specified');
	it.todo('checkout has no project records');
	it.todo('unknown checkout warns and skips');
	it.todo('project references a missing namespace');
	it.todo('namespace references a missing package');
	it.todo('package path has no package.json');
	it.todo('npm info fails');
});
