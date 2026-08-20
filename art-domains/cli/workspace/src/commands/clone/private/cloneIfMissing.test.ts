import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCurrentBranch } from '../../../private/git/getCurrentBranch';
import { createCheckout } from '../../../private/store/createCheckout';
import { createMockCommandContext } from '../../../test/helpers/context/createMockCommandContext';
import { initBareRepoTest } from '../../../test/helpers/git/initBareRepoTest';
import { writeRepoMockRecord } from '../../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { cloneIfMissing } from './cloneIfMissing';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('cloneIfMissing', () => {
	it('checkout without a repo returns null', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'orphan');

		const result = await cloneIfMissing(ctx, checkout);

		expect(result).toBeNull();
	});

	it('clones and checks out the recorded branch when it exists on remote', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		const bareDir = join(tempDir, 'bare/feature-repo');
		await initBareRepoTest(bareDir);

		const setupGit = simpleGit(tempDir);
		await setupGit.clone(bareDir, 'work');
		const workDir = join(tempDir, 'work');
		writeFileSync(join(workDir, 'README.md'), '# feature repo');
		const workGit = simpleGit(workDir);
		await workGit.add('.');
		await workGit.commit('initial commit');
		await workGit.push('origin', 'main');
		await workGit.checkoutLocalBranch('feature-branch');
		await workGit.push('origin', 'feature-branch');

		writeRepoMockRecord(tempDir, 'FeatureRepo', bareDir);
		const { loadRepositoryRecords } =
			await import('../../../private/resources/repository/loadRepositoryRecords');
		const repos = await loadRepositoryRecords(ctx.config);
		const repo = repos.find(r => r.name === 'FeatureRepo');
		expect(repo).toBeDefined();

		const checkout = createCheckout(
			ctx.config,
			'feature-repo',
			repo as NonNullable<typeof repo>,
			'feature-branch',
		);

		const result = await cloneIfMissing(ctx, checkout);

		expect(result).not.toBeNull();
		const branch = await getCurrentBranch(result?.path as string);
		expect(branch).toBe('feature-branch');

		const recordFileName = `${checkout.record.name.toLowerCase().replace(/\s+/g, '-')}-checkout.art`;
		const recordFile = join(tempDir, '_records', recordFileName);
		expect(existsSync(recordFile)).toBe(true);
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('feature-branch');
	});

	it('falls back to default branch when recorded branch does not exist on remote', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		const bareDir = join(tempDir, 'bare/fallback-repo');
		await initBareRepoTest(bareDir);

		const setupGit = simpleGit(tempDir);
		await setupGit.clone(bareDir, 'work');
		const workDir = join(tempDir, 'work');
		writeFileSync(join(workDir, 'README.md'), '# fallback repo');
		const workGit = simpleGit(workDir);
		await workGit.add('.');
		await workGit.commit('initial commit');
		await workGit.push('origin', 'main');

		writeRepoMockRecord(tempDir, 'FallbackRepo', bareDir);
		const { loadRepositoryRecords } =
			await import('../../../private/resources/repository/loadRepositoryRecords');
		const repos = await loadRepositoryRecords(ctx.config);
		const repo = repos.find(r => r.name === 'FallbackRepo');
		expect(repo).toBeDefined();

		const checkout = createCheckout(
			ctx.config,
			'fallback-repo',
			repo as NonNullable<typeof repo>,
			'nonexistent-branch',
		);

		const result = await cloneIfMissing(ctx, checkout);

		expect(result).not.toBeNull();
		const branch = await getCurrentBranch(result?.path as string);
		expect(branch).toBe('main');

		const recordFileName = `${checkout.record.name.toLowerCase().replace(/\s+/g, '-')}-checkout.art`;
		const recordFile = join(tempDir, '_records', recordFileName);
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('main');
	});
});
