import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { makeMockConfig } from '../../../test/helpers/context/makeMockConfig';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { scanExtraneousCheckouts } from './scanExtraneousCheckouts';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanExtraneousCheckouts', () => {
	it('empty checkouts dir returns no extraneous entries', async () => {
		const tempDir = makeTempDir(tempDirs);
		const config = makeMockConfig(tempDir);
		mkdirSync(join(tempDir, config.clone.path), { recursive: true });

		const extraneous = await scanExtraneousCheckouts(config);

		expect(extraneous).toHaveLength(0);
	});
});
