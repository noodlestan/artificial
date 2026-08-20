import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeMockConfig } from '../../../test/helpers/context/makeMockConfig';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { createRecordFile } from '../../records/private/createRecordFile';

import { readCheckoutRecord } from './readCheckoutRecord';
import { saveCheckoutRecord } from './saveCheckoutRecord';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('readCheckoutRecord', () => {
	it('saves and reads a checkout record round-trip', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		const file = join(tempDir, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, data, file);
		const read = await readCheckoutRecord(createRecordFile(tempDir, saved));

		expect(read).toEqual(data);
	});

	it('returns null for a missing file', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'missing.art');

		const read = await readCheckoutRecord(createRecordFile(tempDir, file));

		expect(read).toBeNull();
	});

	it('returns null when kind heading is absent', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'noheading.art');
		writeFileSync(file, '# Module\n\n**Location:** `repos/test`\n\n**Branch:** `main`\n');

		const read = await readCheckoutRecord(createRecordFile(tempDir, file));

		expect(read).toBeNull();
	});

	it('warns and uses defaults for malformed lines', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'malformed.art');
		writeFileSync(file, '# Module\n\n## Checkout: Test\n\n**Location:** `repos/test`\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const read = await readCheckoutRecord(createRecordFile(tempDir, file));

		expect(read).not.toBeNull();
		if (!read) return;
		expect(read.name).toBe('Test');
		expect(read.location).toBe('repos/test');
		expect(read.branch).toBe('main');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing branch'));
	});
});
