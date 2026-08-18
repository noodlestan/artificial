import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { initWorkingRepoTest } from '../../../test/helpers/git/initWorkingRepoTest';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { scanCheckoutState } from '../../scan/scanCheckoutState';
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

import { doPullCheckout } from './doPullCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('doPullCheckout', () => {
	it('pulls a behind checkout and returns the updated state', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'behind');
		await initWorkingRepoTest(repoDir, bareDir);

		// Create an advance in another clone
		const otherDir = makeTempDir(tempDirs);
		await simpleGit(otherDir).clone(bareDir, otherDir);
		const otherGit = simpleGit(otherDir);
		await otherGit.addConfig('user.email', 'test@example.com');
		await otherGit.addConfig('user.name', 'Test');
		writeFileSync(join(otherDir, 'origin.txt'), 'origin');
		await otherGit.add('.');
		await otherGit.commit('origin change');
		await otherGit.push('origin', 'main');

		const git = simpleGit(repoDir);
		await git.fetch('origin', 'main');

		const checkout = createCheckout(ctx.config, 'behind', {
			name: 'Behind',
			remote: 'git@example.com:behind.git',
		});
		const scanned = await scanCheckoutState(checkout);
		expect(scanned.scan?.state('sync').behind).toBe(1);

		const result = await doPullCheckout(ctx, scanned);

		expect(result).not.toBeNull();
		expect(result?.scan?.state('sync').behind).toBe(0);
		expect(existsSync(join(repoDir, 'origin.txt'))).toBe(true);
		expect(ctx.log.all()).toHaveLength(1);
		expect(ctx.log.all()[0].outcome).toBe('success');
	});

	it('logs failure and returns null when the pull fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'nopull');
		await initWorkingRepoTest(repoDir, bareDir);

		// Point remote to a non-existent path so pull fails
		const git = simpleGit(repoDir);
		await git.remote(['set-url', 'origin', join(tempDir, 'missing-origin')]);

		const checkout = createCheckout(ctx.config, 'nopull', {
			name: 'NoPull',
			remote: 'git@example.com:nopull.git',
		});
		checkout.scan = createCheckoutScan([
			createRepoState(true),
			createExistsState(true),
			createRemoteState('main', 'main', true),
			createSyncState(-1, 0, 1),
			createCommittedState(true),
			createNoConflictsState(true),
			createNoDetachedState(true),
		]);

		const result = await doPullCheckout(ctx, checkout);

		expect(result).toBeNull();
		expect(ctx.log.all()).toHaveLength(1);
		expect(ctx.log.all()[0].outcome).toBe('failure');
	});
});
