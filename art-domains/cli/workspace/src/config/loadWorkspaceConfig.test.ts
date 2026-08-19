import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeTempDir } from '../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../test/helpers/tempDirs/removeTempDirs';

import { loadWorkspaceConfig } from './index';

const SOME_CONFIG = JSON.stringify({
	clone: { path: 'clone-path' },
	root: {},
	checkouts: { path: 'checkouts-path', template: 'checkouts-template' },
	records: { pattern: '*.art' },
});

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('loadWorkspaceConfig', () => {
	it('loads default config when config is missing', async () => {
		const tempDir = makeTempDir(tempDirs);

		const config = await loadWorkspaceConfig(tempDir);

		expect(config.clone.path).toBe('repos');
		expect(config.checkouts.path).toBe('_records/');
		expect(config.checkouts.template).toBe('.agents/domains/workspace/templates/checkout.art.njk');
		expect(config.records.pattern).toBe('*.art');
	});

	it('warns when the config is missing', async () => {
		const tempDir = makeTempDir(tempDirs);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const config = await loadWorkspaceConfig(tempDir);

		expect(warn).toHaveBeenCalled();
		expect(config.clone.path).toBe('repos');
		expect(config.records.pattern).toBe('*.art');
	});

	it('returns loaded config when config is present', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, '.art-workspace.mts'), `export default ${SOME_CONFIG}`);

		const config = await loadWorkspaceConfig(tempDir);

		expect(config.root.path).toBe(tempDir);
		expect(config.checkouts.path).toBe('checkouts-path');
		expect(config.checkouts.template).toBe('checkouts-template');
		expect(config.records.pattern).toBe('*.art');
	});

	it('reports the manifest path when the manifest throws on import', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, '.art-workspace.mts'), "throw new Error('boom');\n");

		await expect(loadWorkspaceConfig(tempDir)).rejects.toThrow(/\.art-workspace\.mts/);
	});
});
