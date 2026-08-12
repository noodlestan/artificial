import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeConfig } from '../test/make-config';
import { makeTempDir } from '../test/make-temp-dir';
import { removeTempDirs } from '../test/remove-temp-dirs';

import { defineConfig, loadWorkspaceConfig } from './index';

const SOME_CONFIG = JSON.stringify({
	clone: { path: 'clone-path' },
	root: {},
	records: {
		repositories: { path: 'repositories-path' },
		checkouts: { path: 'checkouts-path', template: 'checkouts-template' },
	},
});

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('defineConfig', () => {
	it('returns the input config unchanged', () => {
		const config = makeConfig('.');

		expect(defineConfig(config)).toEqual(config);
	});
});

describe('loadWorkspaceConfig', () => {
	it('loads default config when config is missing', async () => {
		const tempDir = makeTempDir(tempDirs);

		const config = await loadWorkspaceConfig(tempDir);

		expect(config.clone.path).toBe('repos');
		expect(config.records.repositories.path).toBe('ops/records/repositories');
		expect(config.records.checkouts.path).toBe('ops/records/checkouts');
		expect(config.records.checkouts.template).toBe(
			'.agents/domains/workspace/templates/checkout.art.njk',
		);
	});

	it('warns when the config is missing', async () => {
		const tempDir = makeTempDir(tempDirs);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const config = await loadWorkspaceConfig(tempDir);

		expect(warn).toHaveBeenCalled();
		expect(config.clone.path).toBe('repos');
		expect(config.records.repositories.path).toBe('ops/records/repositories');
	});

	it('returns lodaded config when config is preent', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, '.art-workspace.mts'), `export default ${SOME_CONFIG}`);

		const config = await loadWorkspaceConfig(tempDir);

		expect(config.root.path).toBe(tempDir);
		expect(config.records.repositories.path).toBe('repositories-path');
		expect(config.records.checkouts.path).toBe('checkouts-path');
		expect(config.records.checkouts.template).toBe('checkouts-template');
	});

	it('reports the manifest path when the manifest throws on import', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, '.art-workspace.mts'), "throw new Error('boom');\n");

		await expect(loadWorkspaceConfig(tempDir)).rejects.toThrow(/\.art-workspace\.mts/);
	});
});
