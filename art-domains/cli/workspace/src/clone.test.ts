import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

function writeManifest(
	root: string,
	repos: Array<{ name: string; remote: string }>,
	checkouts: Array<{ repo: string; location: string; branch?: string }> = [],
) {
	const reposStr = repos
		.map(r => `{ name: '${r.name}', remote: '${r.remote}', consumers: [] }`)
		.join(',\n      ');
	const checkoutsStr = checkouts
		.map(c => `{ repo: '${c.repo}', location: '${c.location}', branch: '${c.branch ?? 'main'}' }`)
		.join(',\n      ');
	writeFileSync(
		join(root, '.art-workspace.mts'),
		`export default {
  records: {
    workspace: { name: 'Test', purpose: 'test', remote: 'git@example.com:ws.git', branch: 'main' },
    repos: [${reposStr}],
  },
  checkouts: [${checkoutsStr}],
}
`,
	);
}

describe('clone command', () => {
	it('clones a missing repo and creates the checkout record', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);

		writeManifest(root, [{ name: 'Artificial', remote: bareDir }]);

		await runClone({ root, names: ['Artificial'] });

		const checkoutDir = join(root, 'repos/artificial');
		expect(() => simpleGit(checkoutDir).status()).not.toThrow();

		const recordFile = join(root, 'ops/records/checkouts/artificial.art');
		const { readFileSync } = await import('node:fs');
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

		writeManifest(
			root,
			[{ name: 'Artificial', remote: bareDir }],
			[{ repo: 'Artificial', location: 'working/artificial' }],
		);

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

		writeManifest(
			root,
			[{ name: 'Artificial', remote: bareDir }],
			[{ repo: 'Artificial', location: 'working/artificial' }],
		);

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

		writeManifest(
			root,
			[{ name: 'Artificial', remote: bareDir }],
			[{ repo: 'Artificial', location: 'working/artificial', branch: 'main' }],
		);

		await runClone({ root, names: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('issue');
		expect(output).toContain('branch mismatch');
	});

	it('warns and skips an unknown repo name', async () => {
		const root = makeTempDir();
		writeManifest(root, []);

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

		writeManifest(root, [
			{ name: 'Repo1', remote: bareDir1 },
			{ name: 'Repo2', remote: bareDir2 },
		]);

		await runClone({ root, names: ['all'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('Repo1');
		expect(output).toContain('Repo2');
	});

	it('resolves default location and branch when no checkout override exists', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/my-repo');
		await initBareRepo(bareDir);

		writeManifest(root, [{ name: 'My Repo', remote: bareDir }]);

		await runClone({ root, names: ['My Repo'] });

		const checkoutDir = join(root, 'repos/my-repo');
		const { existsSync } = await import('node:fs');
		expect(existsSync(checkoutDir)).toBe(true);
	});

	it('uses declared override for location and branch', async () => {
		const root = makeTempDir();
		const bareDir = join(root, 'bare/artificial');
		await initBareRepo(bareDir);

		writeManifest(
			root,
			[{ name: 'Artificial', remote: bareDir }],
			[{ repo: 'Artificial', location: 'custom/location', branch: 'develop' }],
		);

		await runClone({ root, names: ['Artificial'] });

		const checkoutDir = join(root, 'custom/location');
		const { existsSync } = await import('node:fs');
		expect(existsSync(checkoutDir)).toBe(true);
	});
});
