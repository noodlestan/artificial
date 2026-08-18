import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { initBareRepoTest } from '../../test/helpers/git/initBareRepoTest';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';
import { createCheckout } from '../store/createCheckout';

import { doClone } from './doClone';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('doClone', () => {
	it('clones a checkout and returns the updated state', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		await initBareRepoTest(bareDir);

		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: bareDir,
		});

		const result = await doClone(ctx, checkout);

		expect(result).not.toBeNull();
		expect(result?.scan?.state('exists').exists).toBe(true);
		expect(ctx.log.all()).toHaveLength(1);
		expect(ctx.log.all()[0].outcome).toBe('success');
	});

	it('logs failure and returns null when clone fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: join(tempDir, 'nonexistent-repo.git'),
		});

		const result = await doClone(ctx, checkout);

		expect(result).toBeNull();
		expect(ctx.log.all()).toHaveLength(1);
		expect(ctx.log.all()[0].outcome).toBe('failure');
	});

	it('returns null when checkout has no repo', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'orphan');

		const result = await doClone(ctx, checkout);

		expect(result).toBeNull();
		expect(ctx.log.all()).toHaveLength(0);
	});
});
