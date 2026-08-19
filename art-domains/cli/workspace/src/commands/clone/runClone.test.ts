import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { initBareRepoTest } from '../../test/helpers/git/initBareRepoTest';
import { initWorkingRepoTest } from '../../test/helpers/git/initWorkingRepoTest';
import { writeCheckoutMockRecord } from '../../test/helpers/records/writeCheckoutMockRecord';
import { writeRepoMockRecord } from '../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { runClone } from './runClone';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('clone command', () => {
	it('clones a missing repo and creates the checkout record', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);

		await runClone(ctx, { repoName: 'Artificial' });

		const repoDir = join(tempDir, ctx.config.clone.path, 'artificial');
		expect(() => simpleGit(repoDir).status()).not.toThrow();

		const recordFile = join(tempDir, '_records/artificial.art');
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `artificial`');
		expect(content).toContain('**Branch:** `main`');
	});

	it('reports issues for a dirty checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);
		const workingDir = join(tempDir, 'repos/artificial');
		await initWorkingRepoTest(workingDir, bareDir);
		writeFileSync(join(workingDir, 'dirty.txt'), 'dirty');

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		await runClone(ctx, { repoName: 'Artificial' });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('uncommitted files');
	});

	it('reports current branch even if different from checkout record', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);
		const workingDir = join(tempDir, 'repos/artificial');
		await initWorkingRepoTest(workingDir, bareDir);
		const git = simpleGit(workingDir);
		await git.checkoutLocalBranch('feature');

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		await runClone(ctx, { repoName: 'Artificial' });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('feature');
	});

	it('errors for an unknown repo name', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await runClone(ctx, { repoName: 'Unknown' });

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('failure');
		expect(ops[0].message()).toContain('Unknown');
	});

	it('clones all repos when --all is passed', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir1 = join(tempDir, 'bare/repo1');
		await initBareRepoTest(bareDir1);
		const bareDir2 = join(tempDir, 'bare/repo2');
		await initBareRepoTest(bareDir2);

		writeRepoMockRecord(tempDir, 'Repo A', bareDir1);
		writeRepoMockRecord(tempDir, 'Repo B', bareDir2);

		await runClone(ctx, { all: true });

		const checkoutDir1 = join(tempDir, ctx.config.clone.path, 'repo-a');
		const checkoutDir2 = join(tempDir, ctx.config.clone.path, 'repo-b');
		expect(existsSync(checkoutDir1)).toBe(true);
		expect(existsSync(checkoutDir2)).toBe(true);
	});

	it('resolves default location and branch when no checkout override exists', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/my-repo');
		await initBareRepoTest(bareDir);

		writeRepoMockRecord(tempDir, 'My Repo', bareDir);

		await runClone(ctx, { repoName: 'My Repo' });

		const checkoutDir = join(tempDir, ctx.config.clone.path, 'my-repo');
		expect(existsSync(checkoutDir)).toBe(true);
	});

	it('uses target location when specified', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);

		await runClone(ctx, { repoName: 'Artificial', checkoutInput: 'custom' });

		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial-custom');
		expect(existsSync(checkoutDir)).toBe(true);
	});

	it('creates checkout named Artificial-foo when cloning Artificial to foo', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);

		await runClone(ctx, { repoName: 'Artificial', checkoutInput: 'foo' });

		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial-foo');
		expect(existsSync(checkoutDir)).toBe(true);

		const recordFile = join(tempDir, '_records/artificial-@-foo.art');
		expect(existsSync(recordFile)).toBe(true);
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `artificial-foo`');
	});

	it('is idempotent when cloning an existing checkout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);

		await runClone(ctx, { repoName: 'Artificial' });
		await runClone(ctx, { repoName: 'Artificial' });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('repos/artificial');
	});

	it('allows multiple checkouts of the same repo with different locations', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const bareDir = join(tempDir, 'bare/artificial');
		await initBareRepoTest(bareDir);

		writeRepoMockRecord(tempDir, 'Artificial', bareDir);

		await runClone(ctx, { repoName: 'Artificial' });
		await runClone(ctx, { repoName: 'Artificial', checkoutInput: 'custom' });

		const checkoutDir1 = join(tempDir, ctx.config.clone.path, 'artificial');
		const checkoutDir2 = join(tempDir, ctx.config.clone.path, 'artificial-custom');
		expect(existsSync(checkoutDir1)).toBe(true);
		expect(existsSync(checkoutDir2)).toBe(true);
	});
});
