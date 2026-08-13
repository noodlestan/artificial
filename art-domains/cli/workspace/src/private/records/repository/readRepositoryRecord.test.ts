import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';
import { writeRepoRecord } from '../../../test/writeRepoRecord';

import { readRepositoryRecord } from './readRepositoryRecord';

export const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('readRepositoryRecord', () => {
	it('parses name, remote, purpose, description, and consumers from a record file', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'ops/records/repositories', 'artificial.art');

		writeRepoRecord(tempDir, 'Artificial', `git@github.com:noodlestan/artificial.git`);

		const record = readRepositoryRecord(file);

		expect(record.name).toBe('Artificial');
		expect(record.remote).toBe('git@github.com:noodlestan/artificial.git');
		expect(record.purpose).toBe('test');
		expect(record.description).toBe(undefined);
	});

	it('returns defaults for a missing file', () => {
		const tempDir = makeTempDir(tempDirs);
		const record = readRepositoryRecord(join(tempDir, 'missing.art'));

		expect(record.name).toBe('');
		expect(record.remote).toBe('');
	});

	it('warns and uses defaults for missing remote', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'norepo.art');
		writeFileSync(file, '# Module\n\n## Repository: NoRemote\n\n**Purpose:** test\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const record = readRepositoryRecord(file);

		expect(record.name).toBe('NoRemote');
		expect(record.remote).toBe('');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing remote'));
	});
});
