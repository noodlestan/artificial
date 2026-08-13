import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeConfig } from '../../../test/makeConfig';
import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';

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
		const config = makeConfig(tempDir);
		const file = join(tempDir, 'test.art');
		const data = { name: 'Artificial', location: 'repos/artificial', branch: 'main' };

		const saved = await saveCheckoutRecord(config, file, data);
		const read = readCheckoutRecord(saved);

		expect(read).toEqual(data);
	});

	it('returns defaults for a missing file', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'missing.art');

		const read = readCheckoutRecord(file);

		expect(read).toEqual({ name: '', location: '', branch: 'main' });
	});

	it('warns and uses defaults for malformed lines', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'malformed.art');
		writeFileSync(file, '# Module\n\n## Checkout: Test\n\n**Location:** `repos/test`\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const read = readCheckoutRecord(file);

		expect(read.name).toBe('Test');
		expect(read.location).toBe('repos/test');
		expect(read.branch).toBe('main');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing branch'));
	});
});
