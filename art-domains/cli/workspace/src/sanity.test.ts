/* eslint-disable no-console */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runSanity } from './sanity';

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-sanity-test-'));
	tempDirs.push(dir);
	return dir;
}

async function initGitRepo(dir: string, opts?: { withRemote?: boolean }) {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init();
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	if (opts?.withRemote) {
		const bareDir = makeTempDir();
		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);
		await git.addRemote('origin', bareDir);
	}
}

async function commitFile(dir: string, filename: string, content = 'content') {
	writeFileSync(join(dir, filename), content);
	const git = simpleGit(dir);
	await git.add('.');
	await git.commit(`add ${filename}`);
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

function writeCheckoutRecord(root: string, name: string, location: string, branch = 'main') {
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

describe('sanity command', () => {
	it('reports "repo not cloned" for a missing checkout', async () => {
		const root = makeTempDir();
		writeManifest(root);
		writeRepoRecord(root, 'Missing', 'git@example.com:missing.git');
		writeCheckoutRecord(root, 'Missing', 'repos/missing');

		await runSanity({ root, auto: false });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('repos/missing');
		expect(output).toContain('repo not cloned');
	});

	it('shows all green message when all repos are green', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/green');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);

		writeManifest(root);
		writeRepoRecord(root, 'Green', 'git@example.com:green.git');
		writeCheckoutRecord(root, 'Green', 'repos/green');

		await runSanity({ root, auto: false });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('All repos are green');
	});

	it('shows dirty repo with pushed? = no', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/dirty');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeManifest(root);
		writeRepoRecord(root, 'Dirty', 'git@example.com:dirty.git');
		writeCheckoutRecord(root, 'Dirty', 'repos/dirty');

		await runSanity({ root, auto: false });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('repos/dirty');
		expect(output).toContain('no');
	});

	it('shows clean unpushed repo with pushed? = no without --auto', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/unpushed');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt');

		writeManifest(root);
		writeRepoRecord(root, 'Unpushed', 'git@example.com:unpushed.git');
		writeCheckoutRecord(root, 'Unpushed', 'repos/unpushed');

		await runSanity({ root, auto: false });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('repos/unpushed');
		expect(output).toContain('no');
	});

	it('pushes clean unpushed repo with --auto and marks as now', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/autopush');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt');

		writeManifest(root);
		writeRepoRecord(root, 'AutoPush', 'git@example.com:autopush.git');
		writeCheckoutRecord(root, 'AutoPush', 'repos/autopush');

		await runSanity({ root, auto: true });

		const logOutput = (console.info as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(logOutput).toContain('All repos are green');
	});

	it('does not push dirty repo with --auto', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/dirtynoauto');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt');
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		writeManifest(root);
		writeRepoRecord(root, 'DirtyNoAuto', 'git@example.com:dirtynoauto.git');
		writeCheckoutRecord(root, 'DirtyNoAuto', 'repos/dirtynoauto');

		await runSanity({ root, auto: true });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('repos/dirtynoauto');
		expect(output).toContain('no');
	});

	it('surfaces detached HEAD', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/detached');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);
		const headSha = await git.revparse(['HEAD']);
		await git.checkout(headSha.trim());

		writeManifest(root);
		writeRepoRecord(root, 'Detached', 'git@example.com:detached.git');
		writeCheckoutRecord(root, 'Detached', 'repos/detached');

		await runSanity({ root, auto: false });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('detached HEAD');
	});

	it('surfaces merge conflicts', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/conflict');
		await initGitRepo(repoDir, { withRemote: true });
		await commitFile(repoDir, 'file.txt', 'base');
		const git = simpleGit(repoDir);
		await git.push('origin', 'main', ['--set-upstream']);

		await git.checkoutLocalBranch('feature');
		writeFileSync(join(repoDir, 'file.txt'), 'feature');
		await git.add('.');
		await git.commit('feature change');

		await git.checkout('main');
		writeFileSync(join(repoDir, 'file.txt'), 'main');
		await git.add('.');
		await git.commit('main change');

		try {
			await git.merge(['feature']);
		} catch {
			// expected conflict
		}

		writeManifest(root);
		writeRepoRecord(root, 'Conflict', 'git@example.com:conflict.git');
		writeCheckoutRecord(root, 'Conflict', 'repos/conflict');

		await runSanity({ root, auto: false });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('merge conflicts');
	});

	it('scaffolds empty template and warns when manifest is missing', async () => {
		const root = makeTempDir();

		await runSanity({ root, auto: false });

		const warnOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnOutput).toContain('.art-workspace.mts');
	});
});
