import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceConfig } from './types';

import { defineConfig, loadWorkspaceConfig, locateCheckouts, verifyCheckouts } from './index';

function makeWorkspaceConfig(
	repos: WorkspaceConfig['records']['repos'],
	checkouts: WorkspaceConfig['checkouts'] = [],
): WorkspaceConfig {
	return {
		records: {
			workspace: {
				name: 'Fixture',
				purpose: 'fixture workspace',
				remote: 'git@example.com:workspace.git',
			},
			repos,
		},
		checkouts,
	};
}

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-workspace-test-'));
	tempDirs.push(dir);
	return dir;
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
	vi.restoreAllMocks();
});

describe('defineConfig', () => {
	it('returns the input config unchanged', () => {
		const config = makeWorkspaceConfig([]);

		expect(defineConfig(config)).toBe(config);
	});
});

describe('locateCheckouts', () => {
	it('returns one RepositoryCheckout per declared checkout entry', () => {
		const config = makeWorkspaceConfig(
			[
				{ name: 'A', remote: 'git@example.com:a.git' },
				{ name: 'B', remote: 'git@example.com:b.git' },
			],
			[
				{ repo: 'A', location: 'repos/a', branch: 'dev' },
				{ repo: 'B', location: 'repos/b', branch: 'main' },
			],
		);

		const checkouts = locateCheckouts(config);

		expect(checkouts).toHaveLength(2);
		expect(checkouts[0]).toEqual({
			repo: config.records.repos[0],
			location: 'repos/a',
			branch: 'dev',
		});
		expect(checkouts[1]).toEqual({
			repo: config.records.repos[1],
			location: 'repos/b',
			branch: 'main',
		});
	});

	it('skips a checkout entry for an unknown repo with a warning', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeWorkspaceConfig(
			[{ name: 'A', remote: 'git@example.com:a.git' }],
			[
				{ repo: 'A', location: 'repos/a', branch: 'main' },
				{ repo: 'Unknown', location: 'repos/unknown', branch: 'main' },
			],
		);

		const checkouts = locateCheckouts(config);

		expect(checkouts).toHaveLength(1);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown'));
	});

	it('returns an empty list when checkouts is empty', () => {
		expect(locateCheckouts(makeWorkspaceConfig([], []))).toEqual([]);
	});

	it('returns two entries when two checkout entries reference the same repo', () => {
		const config = makeWorkspaceConfig(
			[{ name: 'A', remote: 'git@example.com:a.git' }],
			[
				{ repo: 'A', location: 'repos/a', branch: 'main' },
				{ repo: 'A', location: 'repos/a-dev', branch: 'dev' },
			],
		);

		const checkouts = locateCheckouts(config);

		expect(checkouts).toHaveLength(2);
		expect(checkouts.map(checkout => checkout.location)).toEqual(['repos/a', 'repos/a-dev']);
	});
});

describe('loadWorkspaceConfig', () => {
	it('loads an authored manifest from the given root', async () => {
		const root = makeTempDir();
		writeFileSync(
			join(root, '.art-workspace.mts'),
			`export default {
  records: {
    workspace: {
      name: 'Fixture',
      purpose: 'fixture workspace',
      remote: 'git@example.com:workspace.git',
    },
    repos: [{ name: 'A', remote: 'git@example.com:a.git' }],
  },
  checkouts: [{ repo: 'A', location: 'repos/a', branch: 'main' }],
}
`,
		);

		const config = await loadWorkspaceConfig(root);

		expect(config.records.workspace.name).toBe('Fixture');
		expect(config.records.repos).toHaveLength(1);
		expect(config.checkouts).toHaveLength(1);
		expect(config.checkouts[0].repo).toBe('A');
	});

	it('scaffolds an empty template and warns when the manifest is missing', async () => {
		const root = makeTempDir();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const config = await loadWorkspaceConfig(root);

		expect(existsSync(join(root, '.art-workspace.mts'))).toBe(true);
		expect(warn).toHaveBeenCalled();
		expect(config.records.workspace.remote).toBe('');
		expect(config.records.repos).toEqual([]);
	});

	it('reports the manifest path when the manifest throws on import', async () => {
		const root = makeTempDir();
		writeFileSync(join(root, '.art-workspace.mts'), "throw new Error('boom');\n");

		await expect(loadWorkspaceConfig(root)).rejects.toThrow(/\.art-workspace\.mts/);
	});
});

describe('verifyCheckouts', () => {
	it('fills only the requested fields', async () => {
		const root = makeTempDir();
		const checkouts = locateCheckouts(
			makeWorkspaceConfig(
				[{ name: 'A', remote: 'git@example.com:a.git' }],
				[{ repo: 'A', location: 'repos/a', branch: 'main' }],
			),
		);

		await verifyCheckouts(checkouts, { exists: true }, root);

		expect(checkouts[0].exists).toBeDefined();
		expect(checkouts[0].pushed).toBeUndefined();
		expect(checkouts[0].published).toBeUndefined();
	});

	it('sets exists: false for a missing directory', async () => {
		const root = makeTempDir();
		const checkouts = locateCheckouts(
			makeWorkspaceConfig(
				[{ name: 'A', remote: 'git@example.com:a.git' }],
				[{ repo: 'A', location: 'repos/a', branch: 'main' }],
			),
		);

		await verifyCheckouts(checkouts, { exists: true }, root);

		expect(checkouts[0].exists).toBe(false);
	});

	it('sets exists: true for an existing directory', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/a');
		const { mkdirSync } = await import('node:fs');
		mkdirSync(repoDir, { recursive: true });

		const checkouts = locateCheckouts(
			makeWorkspaceConfig(
				[{ name: 'A', remote: 'git@example.com:a.git' }],
				[{ repo: 'A', location: 'repos/a', branch: 'main' }],
			),
		);

		await verifyCheckouts(checkouts, { exists: true }, root);

		expect(checkouts[0].exists).toBe(true);
	});

	it('sets pushed: false for a missing directory', async () => {
		const root = makeTempDir();
		const checkouts = locateCheckouts(
			makeWorkspaceConfig(
				[{ name: 'A', remote: 'git@example.com:a.git' }],
				[{ repo: 'A', location: 'repos/a', branch: 'main' }],
			),
		);

		await verifyCheckouts(checkouts, { pushed: true }, root);

		expect(checkouts[0].pushed).toBe(false);
	});

	it('sets pushed: false for a repo with no remote', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/a');
		const { mkdirSync } = await import('node:fs');
		const { execSync: exec } = await import('node:child_process');
		mkdirSync(repoDir, { recursive: true });
		exec('git init', { cwd: repoDir });
		exec('git config user.email "test@example.com"', { cwd: repoDir });
		exec('git config user.name "Test"', { cwd: repoDir });
		writeFileSync(join(repoDir, 'file.txt'), 'content');
		exec('git add .', { cwd: repoDir });
		exec('git commit -m "initial"', { cwd: repoDir });

		const checkouts = locateCheckouts(
			makeWorkspaceConfig(
				[{ name: 'A', remote: 'git@example.com:a.git' }],
				[{ repo: 'A', location: 'repos/a', branch: 'main' }],
			),
		);

		await verifyCheckouts(checkouts, { pushed: true }, root);

		expect(checkouts[0].pushed).toBe(false);
	});

	it('sets pushed: false for a dirty working tree', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/a');
		const { mkdirSync } = await import('node:fs');
		const { execSync } = await import('node:child_process');
		mkdirSync(repoDir, { recursive: true });
		execSync('git init', { cwd: repoDir });
		execSync('git config user.email "test@example.com"', { cwd: repoDir });
		execSync('git config user.name "Test"', { cwd: repoDir });
		execSync('git remote add origin git@example.com:a.git', { cwd: repoDir });
		writeFileSync(join(repoDir, 'file.txt'), 'content');
		execSync('git add .', { cwd: repoDir });
		execSync('git commit -m "initial"', { cwd: repoDir });
		writeFileSync(join(repoDir, 'dirty.txt'), 'dirty');

		const checkouts = locateCheckouts(
			makeWorkspaceConfig(
				[{ name: 'A', remote: 'git@example.com:a.git' }],
				[{ repo: 'A', location: 'repos/a', branch: 'main' }],
			),
		);

		await verifyCheckouts(checkouts, { pushed: true }, root);

		expect(checkouts[0].pushed).toBe(false);
	});
});
