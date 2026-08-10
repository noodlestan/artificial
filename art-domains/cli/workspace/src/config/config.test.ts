import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { RepositoryCheckout, WorkspaceConfig } from './types';

import { defineConfig, loadWorkspaceConfig, verifyCheckouts } from './index';

function makeWorkspaceConfig(overrides?: Partial<WorkspaceConfig>): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		records: {
			repositories: { path: 'ops/records/repositories' },
			checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },
		},
		...overrides,
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
		const config = makeWorkspaceConfig();

		expect(defineConfig(config)).toBe(config);
	});
});

describe('loadWorkspaceConfig', () => {
	it('loads an authored manifest from the given root', async () => {
		const root = makeTempDir();
		writeFileSync(
			join(root, '.art-workspace.mts'),
			`export default {
  clone: { path: 'repos' },
  records: {
    repositories: { path: 'ops/records/repositories' },
    checkouts: { path: 'ops/records/checkouts', template: '.agents/domains/workspace/templates/checkout.art.njk' },
  },
}
`,
		);

		const config = await loadWorkspaceConfig(root);

		expect(config.clone.path).toBe('repos');
		expect(config.records.repositories.path).toBe('ops/records/repositories');
		expect(config.records.checkouts.path).toBe('ops/records/checkouts');
		expect(config.records.checkouts.template).toBe(
			'.agents/domains/workspace/templates/checkout.art.njk',
		);
	});

	it('scaffolds an empty template and warns when the manifest is missing', async () => {
		const root = makeTempDir();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const config = await loadWorkspaceConfig(root);

		expect(existsSync(join(root, '.art-workspace.mts'))).toBe(true);
		expect(warn).toHaveBeenCalled();
		expect(config.clone.path).toBe('repos');
		expect(config.records.repositories.path).toBe('ops/records/repositories');
	});

	it('reports the manifest path when the manifest throws on import', async () => {
		const root = makeTempDir();
		writeFileSync(join(root, '.art-workspace.mts'), "throw new Error('boom');\n");

		await expect(loadWorkspaceConfig(root)).rejects.toThrow(/\.art-workspace\.mts/);
	});
});

describe('verifyCheckouts', () => {
	function makeCheckout(overrides?: Partial<RepositoryCheckout>): RepositoryCheckout {
		return {
			repo: { name: 'A', remote: 'git@example.com:a.git' },
			location: 'repos/a',
			branch: 'main',
			...overrides,
		};
	}

	it('fills only the requested fields', async () => {
		const root = makeTempDir();
		const checkouts = [makeCheckout()];

		await verifyCheckouts(checkouts, { exists: true }, root);

		expect(checkouts[0].exists).toBeDefined();
		expect(checkouts[0].pushed).toBeUndefined();
		expect(checkouts[0].published).toBeUndefined();
	});

	it('sets exists: false for a missing directory', async () => {
		const root = makeTempDir();
		const checkouts = [makeCheckout()];

		await verifyCheckouts(checkouts, { exists: true }, root);

		expect(checkouts[0].exists).toBe(false);
	});

	it('sets exists: true for an existing directory', async () => {
		const root = makeTempDir();
		const repoDir = join(root, 'repos/a');
		const { mkdirSync } = await import('node:fs');
		mkdirSync(repoDir, { recursive: true });

		const checkouts = [makeCheckout()];

		await verifyCheckouts(checkouts, { exists: true }, root);

		expect(checkouts[0].exists).toBe(true);
	});

	it('sets pushed: false for a missing directory', async () => {
		const root = makeTempDir();
		const checkouts = [makeCheckout()];

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

		const checkouts = [makeCheckout()];

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

		const checkouts = [makeCheckout()];

		await verifyCheckouts(checkouts, { pushed: true }, root);

		expect(checkouts[0].pushed).toBe(false);
	});
});
