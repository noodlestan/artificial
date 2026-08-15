import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { scanWorkspaceState } from './scanWorkspaceState';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('scanWorkspaceState', () => {
	it('scans workspace root state', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);

		const git = simpleGit(tempDir);
		await git.init();
		await git.addConfig('user.email', 'test@example.com');
		await git.addConfig('user.name', 'Test');
		await git.addRemote('origin', bareDir);
		writeFileSync(join(tempDir, 'README.md'), '# Test');

		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);

		await git.add('.');
		await git.commit('initial');
		await git.push('origin', 'main', ['--set-upstream']);

		const ctx = createCommandContext(tempDir);
		const workspace = await scanWorkspaceState(ctx);

		expect(workspace.exists).toBe(true);
		expect(workspace.record.name).toBe('Workspace');
		expect(workspace.record.location).toBe('.');
		expect(workspace.record.branch).toBe('main');
		expect(workspace.path).toBe(tempDir);
		expect(workspace.hasRemote).toBe(true);
		expect(workspace.dirty).toBe(false);
		expect(workspace.issues).toEqual([]);
	});

	it('detects dirty workspace', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);

		const git = simpleGit(tempDir);
		await git.init();
		await git.addConfig('user.email', 'test@example.com');
		await git.addConfig('user.name', 'Test');
		await git.addRemote('origin', bareDir);

		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);

		writeFileSync(join(tempDir, 'README.md'), '# Test');
		await git.add('.');
		await git.commit('initial');
		await git.push('origin', 'main', ['--set-upstream']);

		writeFileSync(join(tempDir, 'dirty.txt'), 'dirty');

		const ctx = createCommandContext(tempDir);
		const workspace = await scanWorkspaceState(ctx);

		expect(workspace.dirty).toBe(true);
		expect(workspace.issues).toContain('uncommitted files');
	});

	it('detects unpushed commits', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);

		const git = simpleGit(tempDir);
		await git.init();
		await git.addConfig('user.email', 'test@example.com');
		await git.addConfig('user.name', 'Test');
		await git.addRemote('origin', bareDir);

		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);

		writeFileSync(join(tempDir, 'README.md'), '# Test');
		await git.add('.');
		await git.commit('initial');
		await git.push('origin', 'main', ['--set-upstream']);

		writeFileSync(join(tempDir, 'file.txt'), 'content');
		await git.add('.');
		await git.commit('second');

		const ctx = createCommandContext(tempDir);
		const workspace = await scanWorkspaceState(ctx);

		expect(workspace.unpushed).toBe(1);
		expect(workspace.issues).toContain('1 commit ahead');
	});

	it('detects when workspace is behind', async () => {
		const tempDir = makeTempDir(tempDirs);
		const bareDir = makeTempDir(tempDirs);

		const git = simpleGit(tempDir);
		await git.init();
		await git.addConfig('user.email', 'test@example.com');
		await git.addConfig('user.name', 'Test');
		await git.addRemote('origin', bareDir);

		const bareGit = simpleGit(bareDir);
		await bareGit.init(true);

		writeFileSync(join(tempDir, 'README.md'), '# Test');
		await git.add('.');
		await git.commit('initial');
		await git.push('origin', 'main', ['--set-upstream']);

		const otherDir = makeTempDir(tempDirs);
		await simpleGit(otherDir).clone(bareDir, otherDir);
		const otherGit = simpleGit(otherDir);
		await otherGit.addConfig('user.email', 'test@example.com');
		await otherGit.addConfig('user.name', 'Test');
		writeFileSync(join(otherDir, 'origin.txt'), 'origin');
		await otherGit.add('.');
		await otherGit.commit('origin change');
		await otherGit.push('origin', 'main');

		await git.fetch('origin', 'main');

		const ctx = createCommandContext(tempDir);
		const workspace = await scanWorkspaceState(ctx);

		expect(workspace.isBehind).toBe(true);
		expect(workspace.issues).toContain('1 commit behind');
	});

	it('detects no remote', async () => {
		const tempDir = makeTempDir(tempDirs);

		const git = simpleGit(tempDir);
		await git.init();
		await git.addConfig('user.email', 'test@example.com');
		await git.addConfig('user.name', 'Test');
		writeFileSync(join(tempDir, 'README.md'), '# Test');
		await git.add('.');
		await git.commit('initial');

		const ctx = createCommandContext(tempDir);
		const workspace = await scanWorkspaceState(ctx);

		expect(workspace.hasRemote).toBe(false);
		expect(workspace.issues).toContain('no remote');
	});
});
