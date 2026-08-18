import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { commitFileTest } from '../../../test/helpers/git/commitFileTest';
import { initGitRepoTest } from '../../../test/helpers/git/initGitRepoTest';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import {
	createCheckoutScan,
	createCommittedState,
	createExistsState,
	createNoConflictsState,
	createNoDetachedState,
	createRemoteState,
	createRepoState,
	createSyncState,
} from '../../scan/types';
import { createCheckout } from '../../store/createCheckout';

import { doPushCheckout } from './doPushCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('doPushCheckout', () => {
	it('pushing a checkout with no remote logs a failure operation', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const repoDir = join(tempDir, ctx.config.clone.path, 'my-repo');
		await initGitRepoTest(repoDir);
		await commitFileTest(repoDir, 'file.txt');

		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		checkout.scan = createCheckoutScan([
			createRepoState(true),
			createExistsState(true),
			createRemoteState('main', 'main', false),
			createSyncState(0),
			createCommittedState(true),
			createNoConflictsState(true),
			createNoDetachedState(true),
		]);

		await doPushCheckout(ctx, checkout);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('failure');
	});
});
