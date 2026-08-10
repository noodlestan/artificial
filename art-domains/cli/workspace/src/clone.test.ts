import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runClone } from './clone';

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-clone-test-'));
	tempDirs.push(dir);
	return dir;
}

async function initBareRepo(dir: string): Promise<string> {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init(true);
	return dir;
}

async function initWorkingRepo(dir: string, bareDir: string): Promise<void> {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init();
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	await git.addRemote('origin', bareDir);
	writeFileSync(join(dir, 'README.md'), '# Test');
	await git.add('.');
	await git.commit('initial');
	await git.push('origin', 'main', ['--set-upstream']);
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
	process.exitCode = undefined;
});

function writeManifest(root: string) {
	writeFileSync(
		join(root, '.art-workspace.mts'),
		`export default {
  clone: { path: 'repos' },
  records: {
    repositories: { path: 'ops/records/repositories' },
    checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },
  },
}
`,
	);
}

function writeRepoRecord(root: string, name: string, remote: string) {
	const dir = join(root, 'ops/records/repositories');
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, `${name.toLowerCase().replace(/\s+/g, '-')}.art`),
		`# Module

## Repository: ${name}

**Purpose:** test

**Remote:** \`${remote}\`
`,
	);
}

function writeCheckoutRecordFile(root: string, name: string, location: string, branch = 'main') {
	const dir = join(root, 'ops/records/checkouts');
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, `${name.toLowerCase().replace(/\s+/g, '-')}.art`),
		`# Module

## Checkout: ${name}

**Location:** \`${location}\`

**Branch:** \`${branch}\`
`,
	);
}

describe('clone command', () => {
	it('clones a missing repo and creates the checkout record', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);

		writeManifest(root);
		writeRepoRecord(root, 'Artificial', bareDir);

		await runClone({ root, names: ['Artificial'] });

		const checkoutDir = join(root, 'repos/artificial');
		expect(() => simpleGit(checkoutDir).status()).not.toThrow();

		const recordFile = join(root, 'ops/records/checkouts/artificial.art');
		const content = readFileSync(recordFile, 'utf-8');
		expect(content).toContain('## Checkout: Artificial');
		expect(content).toContain('**Location:** `repos/artificial`');
		expect(content).toContain('**Branch:** `main`');
	});

	it('reports "exists" for an existing clean checkout on the correct branch', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);
		const workingDir = join(root, 'working/artificial');
		await initWorkingRepo(workingDir, bareDir);

		writeManifest(root);
		writeRepoRecord(root, 'Artificial', bareDir);
		writeCheckoutRecordFile(root, 'Artificial', 'working/artificial');

		await runClone({ root, names: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('exists');
	});

	it('reports an issue for a dirty checkout', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);
		const workingDir = join(root, 'working/artificial');
		await initWorkingRepo(workingDir, bareDir);
		writeFileSync(join(workingDir, 'dirty.txt'), 'dirty');

		writeManifest(root);
		writeRepoRecord(root, 'Artificial', bareDir);
		writeCheckoutRecordFile(root, 'Artificial', 'working/artificial');

		await runClone({ root, names: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('issue');
		expect(output).toContain('dirty');
		expect(process.exitCode).toBe(1);
	});

	it('reports an issue for a branch mismatch', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);
		const workingDir = join(root, 'working/artificial');
		await initWorkingRepo(workingDir, bareDir);
		const git = simpleGit(workingDir);
		await git.checkoutLocalBranch('feature');

		writeManifest(root);
		writeRepoRecord(root, 'Artificial', bareDir);
		writeCheckoutRecordFile(root, 'Artificial', 'working/artificial', 'main');

		await runClone({ root, names: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('issue');
		expect(output).toContain('branch mismatch');
	});

	it('warns and skips an unknown repo name', async () => {
		const root = makeTempDir();
		writeManifest(root);

		await runClone({ root, names: ['Unknown'] });

		const warnOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnOutput).toContain('Unknown');
	});

	it('clones all repos when "all" is passed', async () => {
		const root = makeTempDir();
		const bareDir1 = join(root, 'bare/repo1');
		await initBareRepo(bareDir1);
		const bareDir2 = join(root, 'bare/repo2');
		await initBareRepo(bareDir2);

		writeManifest(root);
		writeRepoRecord(root, 'Repo1', bareDir1);
		writeRepoRecord(root, 'Repo2', bareDir2);

		await runClone({ root, names: ['all'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('Repo1');
		expect(output).toContain('Repo2');
	});

	it('resolves default location and branch when no checkout override exists', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/my-repo');
		await initBareRepo(bareDir);

		writeManifest(root);
		writeRepoRecord(root, 'My Repo', bareDir);

		await runClone({ root, names: ['My Repo'] });

		const checkoutDir = join(root, 'repos/my-repo');
		expect(existsSync(checkoutDir)).toBe(true);
	});

	it('uses declared override for location and branch', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);

		writeManifest(root);
		writeRepoRecord(root, 'Artificial', bareDir);
		writeCheckoutRecordFile(root, 'Artificial', 'custom/location', 'develop');

		await runClone({ root, names: ['Artificial'] });

		const checkoutDir = join(root, 'custom/location');
		expect(existsSync(checkoutDir)).toBe(true);
	});
});
