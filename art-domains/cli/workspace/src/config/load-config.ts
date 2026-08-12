import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'esbuild';

import type { WorkspaceConfig } from './types';

const MANIFEST_FILE = '.art-workspace.mts';
const TEMP_FILE = '.art-workspace-bundle.mjs';

const DEFAULT_CONFIG = {
	clone: { path: 'repos' },
	root: {},
	records: {
		repositories: { path: 'ops/records/repositories' },
		checkouts: {
			path: 'ops/records/checkouts',
			template: '.agents/domains/workspace/templates/checkout.art.njk',
		},
	},
};

function formatError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export async function loadWorkspaceConfig(rootPath: string): Promise<WorkspaceConfig> {
	const manifestPath = join(rootPath, MANIFEST_FILE);

	if (!existsSync(manifestPath)) {
		console.warn(`${MANIFEST_FILE} not found at ${rootPath}; Using default config.`);
		const root = { ...DEFAULT_CONFIG.root, path: rootPath };
		return { ...DEFAULT_CONFIG, root };
	}

	let output;
	try {
		output = await build({
			entryPoints: [manifestPath],
			bundle: true,
			write: false,
			format: 'esm',
			platform: 'node',
			external: [
				'node:fs',
				'node:os',
				'node:path',
				'node:url',
				'fs',
				'os',
				'path',
				'url',
				'esbuild',
				'simple-git',
			],
		});
	} catch (error) {
		throw new Error(
			`Failed to bundle workspace manifest at ${manifestPath}: ${formatError(error)}`,
		);
	}

	const tempFile = join(rootPath, TEMP_FILE);
	writeFileSync(tempFile, output.outputFiles[0].text);

	try {
		const loaded = await import(pathToFileURL(tempFile).href);
		const config = loaded.default as WorkspaceConfig;
		config.root.path = rootPath;
		return config;
	} catch (error) {
		throw new Error(`Failed to load workspace manifest at ${manifestPath}: ${formatError(error)}`);
	}
}
