import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'esbuild';

import type { WorkspaceConfig } from './types';

const MANIFEST_FILE = '.art-workspace.mts';
const TEMP_FILE = '.art-workspace-bundle.mjs';

const EMPTY_TEMPLATE = `export default {
	records: {
		workspace: {
			name: '',
			purpose: '',
			description: '',
			remote: '',
			branch: '',
		},
		repos: [],
	},
}
`;

function formatError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Locate (or scaffold) the workspace manifest, transpile it to JS with esbuild
 * bundle-at-runtime (Vite-style), import it, and return the resolved config.
 */
export async function loadWorkspaceConfig(root: string): Promise<WorkspaceConfig> {
	const manifestPath = join(root, MANIFEST_FILE);

	if (!existsSync(manifestPath)) {
		writeFileSync(manifestPath, EMPTY_TEMPLATE);
		console.warn(`${MANIFEST_FILE} not found at ${root}; scaffolded an empty template`);
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

	const tempFile = join(root, TEMP_FILE);
	writeFileSync(tempFile, output.outputFiles[0].text);

	try {
		const loaded = await import(pathToFileURL(tempFile).href);
		return loaded.default as WorkspaceConfig;
	} catch (error) {
		throw new Error(`Failed to load workspace manifest at ${manifestPath}: ${formatError(error)}`);
	}
}
