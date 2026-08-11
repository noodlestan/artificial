/* eslint-disable no-console */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadWorkspaceConfig } from '../../config/load-config';
import { createBranchFailure } from '../../private/operations/create-branch-failure';
import { createBranchSuccess } from '../../private/operations/create-branch-success';
import { createCheckout } from '../../shared/checkout';
import { createCheckoutStore } from '../../shared/checkout-store';
import { createOperationsLog } from '../../shared/operations-log';
import { createWorkspaceContext } from '../../shared/workspace-context';

import { runBranch } from './branch';

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-branch-test-'));
	tempDirs.push(dir);
	return dir;
}

async function initGitRepo(dir: string) {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init();
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	writeFileSync(join(dir, 'file.txt'), 'content');
	await git.add('.');
	await git.commit('add file.txt');
}

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
	vi.restoreAllMocks();
});

function writeManifest(root: string) {
	writeFileSync(
		join(root, '.art-workspace.mts'),
		'export default {\n' +
			"  clone: { path: 'repos' },\n" +
			'  records: {\n' +
			"    repositories: { path: 'ops/records/repositories' },\n" +
			"    checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },\n" +
			'  },\n' +
			'}\n',
	);
}

function writeRepoRecord(root: string, name: string, remote: string) {
	const dir = join(root, 'ops/records/repositories');
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Repository: ' +
			name +
			'\n\n**Purpose:** test\n\n**Remote:** `' +
			remote +
			'`\n',
	);
}

function writeCheckoutRecord(root: string, name: string, location: string, branch = 'main') {
	const dir = join(root, 'ops/records/checkouts');
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Checkout: ' +
			name +
			'\n\n**Location:** `' +
			location +
			'`\n\n**Branch:** `' +
			branch +
			'`\n',
	);
}

async function runBranchWithRoot(root: string, branch: string, checkoutNames: string[]) {
	const config = await loadWorkspaceConfig(root);
	const store = createCheckoutStore(config, root);
	const log = createOperationsLog();
	const ctx = createWorkspaceContext(config, root, store, log);
	await runBranch(ctx, branch, checkoutNames);
	return { store, log };
}

describe('branch command', () => {
	it('creates and checks out a new branch in a single specified checkout', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/one');
		await initGitRepo(repoDir);

		writeManifest(root);
		writeRepoRecord(root, 'One', 'git@example.com:one.git');
		writeCheckoutRecord(root, 'One', 'repos/one');

		const { store, log } = await runBranchWithRoot(root, 'feat/x', ['One']);

		const checkout = store.findCheckout('One');
		expect(checkout).toBeDefined();
		expect(checkout?.branch).toBe('feat/x');
		expect(checkout?.record.branch).toBe('feat/x');

		const ops = log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('branch created');
		expect(ops[0].outcome).toBe('success');
		expect(ops[0].message()).toBe('created feat/x');

		const git = simpleGit(repoDir);
		expect(await git.revparse(['--abbrev-ref', 'HEAD'])).toContain('feat/x');
	});

	it('branches all checkouts when none are specified', async () => {
		const root = makeTempDir();
		await initGitRepo(join(root, 'repos/alpha'));
		await initGitRepo(join(root, 'repos/beta'));

		writeManifest(root);
		writeRepoRecord(root, 'Alpha', 'git@example.com:alpha.git');
		writeRepoRecord(root, 'Beta', 'git@example.com:beta.git');
		writeCheckoutRecord(root, 'Alpha', 'repos/alpha');
		writeCheckoutRecord(root, 'Beta', 'repos/beta');

		const { store, log } = await runBranchWithRoot(root, 'feat/x', []);

		const ops = log.all();
		expect(ops).toHaveLength(2);
		expect(ops.every(o => o.operation === 'branch created' && o.outcome === 'success')).toBe(true);
		expect(store.findCheckout('Alpha')?.branch).toBe('feat/x');
		expect(store.findCheckout('Beta')?.branch).toBe('feat/x');

		for (const name of ['Alpha', 'Beta']) {
			const git = simpleGit(join(root, 'repos/' + name.toLowerCase()));
			expect(await git.revparse(['--abbrev-ref', 'HEAD'])).toContain('feat/x');
		}
	});

	it('warns and skips an unknown checkout', async () => {
		const root = makeTempDir();
		await initGitRepo(join(root, 'repos/one'));

		writeManifest(root);
		writeRepoRecord(root, 'One', 'git@example.com:one.git');
		writeCheckoutRecord(root, 'One', 'repos/one');

		const { log } = await runBranchWithRoot(root, 'feat/x', ['Nope']);

		expect(log.all()).toHaveLength(0);
		expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('unknown checkout'));
	});

	it('logs a failure and continues when a checkout is not cloned', async () => {
		const root = makeTempDir();
		await initGitRepo(join(root, 'repos/good'));

		writeManifest(root);
		writeRepoRecord(root, 'Good', 'git@example.com:good.git');
		writeRepoRecord(root, 'Missing', 'git@example.com:missing.git');
		writeCheckoutRecord(root, 'Good', 'repos/good');
		writeCheckoutRecord(root, 'Missing', 'repos/missing');

		const { store, log } = await runBranchWithRoot(root, 'feat/x', ['Missing', 'Good']);

		const ops = log.all();
		const failure = ops.find(o => o.outcome === 'failure');
		expect(failure).toBeDefined();
		expect(failure?.operation).toBe('branch created');
		expect(failure?.message()).toContain('checkout not cloned');
		expect(ops.filter(o => o.outcome === 'success')).toHaveLength(1);
		expect(store.findCheckout('Good')?.branch).toBe('feat/x');
	});

	it('branches a checkout with no matching repository record via a synthetic repository', async () => {
		const root = makeTempDir();
		await initGitRepo(join(root, 'repos/conv'));

		writeManifest(root);
		writeCheckoutRecord(root, 'Conv', 'repos/conv');

		const { store, log } = await runBranchWithRoot(root, 'feat/x', ['Conv']);

		const checkout = store.findCheckout('Conv');
		expect(checkout).toBeDefined();
		expect(checkout?.repo.remote).toBe('');
		expect(checkout?.branch).toBe('feat/x');
		expect(log.all()).toHaveLength(1);
		expect(log.all()[0].outcome).toBe('success');
	});

	it('switches to an existing branch', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/one');
		await initGitRepo(repoDir);
		const git = simpleGit(repoDir);
		await git.checkoutLocalBranch('feat/x');

		writeManifest(root);
		writeRepoRecord(root, 'One', 'git@example.com:one.git');
		writeCheckoutRecord(root, 'One', 'repos/one');

		const { store, log } = await runBranchWithRoot(root, 'feat/x', ['One']);

		const ops = log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].outcome).toBe('success');
		expect(ops[0].message()).toBe('switched to feat/x');
		expect(store.findCheckout('One')?.branch).toBe('feat/x');
	});

	it('factory defaults and serialization', () => {
		const checkout = createCheckout(
			{ name: 'One', remote: 'git@example.com:one.git' },
			'repos/one',
			'main',
		);

		const success = createBranchSuccess(checkout, 'feat/x');
		expect(success.message()).toBe('created feat/x');

		const failure = createBranchFailure(checkout, 'feat/x', new Error('boom (reason)'));
		expect(failure.errorSerialized()).toContain('boom');
		expect(failure.errorSerialized()).toContain('reason');
	});
});
