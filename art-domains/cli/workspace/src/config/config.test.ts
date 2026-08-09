import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceConfig } from './types';

import { defineConfig, loadWorkspaceConfig, locateCheckouts } from './index';

function makeWorkspaceConfig(repos: WorkspaceConfig['records']['repos']): WorkspaceConfig {
	return {
		records: {
			workspace: {
				name: 'Fixture',
				purpose: 'fixture workspace',
				remote: 'git@example.com:workspace.git',
			},
			repos,
		},
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
	it('returns one RepositoryCheckout per repo with a checkout field', () => {
		const config = makeWorkspaceConfig([
			{ name: 'A', remote: 'git@example.com:a.git', checkout: 'repos/a', branch: 'dev' },
			{ name: 'B', remote: 'git@example.com:b.git', checkout: 'repos/b' },
		]);

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

	it('skips a repo without a checkout with a warning', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeWorkspaceConfig([
			{ name: 'A', remote: 'git@example.com:a.git', checkout: 'repos/a' },
			{ name: 'B', remote: 'git@example.com:b.git' },
		]);

		const checkouts = locateCheckouts(config);

		expect(checkouts).toHaveLength(1);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('B'));
	});

	it('returns an empty list when there are no repos', () => {
		expect(locateCheckouts(makeWorkspaceConfig([]))).toEqual([]);
	});

	it('returns two entries when the same repo has two checkouts', () => {
		const config = makeWorkspaceConfig([
			{ name: 'A', remote: 'git@example.com:a.git', checkout: 'repos/a' },
			{ name: 'A', remote: 'git@example.com:a.git', checkout: 'repos/a-dev' },
		]);

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
    repos: [{ name: 'A', remote: 'git@example.com:a.git', checkout: 'repos/a' }],
  },
}
`,
		);

		const config = await loadWorkspaceConfig(root);

		expect(config.records.workspace.name).toBe('Fixture');
		expect(config.records.repos).toHaveLength(1);
		expect(config.records.repos[0].checkout).toBe('repos/a');
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
