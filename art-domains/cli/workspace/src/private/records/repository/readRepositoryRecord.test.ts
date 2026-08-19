import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { writeRepoMockRecord } from '../../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { readRepositoryRecord } from './readRepositoryRecord';

export const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('readRepositoryRecord', () => {
	it('parses name, remote, purpose, description, and consumers from a record file', () => {
		const tempDir = makeTempDir(tempDirs);

		writeRepoMockRecord(tempDir, 'Artificial', `git@github.com:noodlestan/artificial.git`);

		const record = readRepositoryRecord(join(tempDir, '_records/artificial.art'));

		expect(record).not.toBeNull();
		if (!record) return;
		expect(record.name).toBe('Artificial');
		expect(record.remote).toBe('git@github.com:noodlestan/artificial.git');
		expect(record.purpose).toBe('test');
		expect(record.description).toBe(undefined);
	});

	it('returns null for a missing file', () => {
		const tempDir = makeTempDir(tempDirs);
		const record = readRepositoryRecord(join(tempDir, 'missing.art'));

		expect(record).toBeNull();
	});

	it('returns null when kind heading is absent', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'noheading.art');
		writeFileSync(
			file,
			'# Module\n\n**Purpose:** test\n\n**Remote:** `git@example.com:test.git`\n',
		);

		const record = readRepositoryRecord(file);

		expect(record).toBeNull();
	});

	it('warns and uses defaults for missing remote', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'norepo.art');
		writeFileSync(file, '# Module\n\n## Repository: NoRemote\n\n**Purpose:** test\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const record = readRepositoryRecord(file);

		expect(record).not.toBeNull();
		if (!record) return;
		expect(record.name).toBe('NoRemote');
		expect(record.remote).toBe('');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing remote'));
	});
});
