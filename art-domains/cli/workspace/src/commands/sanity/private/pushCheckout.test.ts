import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCheckout } from '../../../private/store/createCheckout';
import { commitFile } from '../../../test/commitFile';
import { createCommandContext } from '../../../test/createCommandContext';
import { initGitRepo } from '../../../test/initGitRepo';
import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';

import { pushCheckout } from './pushCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('pushCheckout', () => {
	it('pushing a checkout with no remote logs a failure operation', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const repoDir = join(tempDir, ctx.config.clone.path, 'my-repo');
		await initGitRepo(repoDir);
		await commitFile(repoDir, 'file.txt');

		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		checkout.exists = true;

		await pushCheckout(ctx, checkout);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('failure');
	});
});
