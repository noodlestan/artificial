import type { PartialWorkspaceConfig, WorkspaceConfig } from './types';

export function defineConfig(config: PartialWorkspaceConfig): WorkspaceConfig {
	const clonePath = config.clone?.path || 'repos';
	const rootPath = config.root?.path || process.cwd();
	const repositoriesPath = config.records?.repositories?.path || 'repos';
	const checkoutsPath = config.records?.checkouts?.path || '<missing';
	const checkoutTemplatePath = config.records?.checkouts?.template || '<missing';

	return {
		clone: {
			path: clonePath,
		},
		root: {
			path: rootPath,
		},
		records: {
			repositories: {
				path: repositoriesPath,
			},
			checkouts: {
				path: checkoutsPath,
				template: checkoutTemplatePath,
			},
		},
	};
}
