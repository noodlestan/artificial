import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../test/createCommandContext';
import { makeTempDir } from '../test/makeTempDir';
import { removeTempDirs } from '../test/removeTempDirs';

import { scanExtraneousCheckouts } from './scanExtraneousCheckouts';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanExtraneousCheckouts', () => {
	it('empty checkouts dir returns no extraneous entries', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		mkdirSync(join(tempDir, ctx.config.clone.path), { recursive: true });

		await scanExtraneousCheckouts(ctx);

		expect(ctx.store.getExtraneous()).toHaveLength(0);
	});
});
