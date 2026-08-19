import type { PartialWorkspaceConfig, WorkspaceConfig } from './types';

export function defineConfig(config: PartialWorkspaceConfig): WorkspaceConfig {
	const clonePath = config.clone?.path || 'repos';
	const rootPath = config.root?.path || process.cwd();
	const checkoutsPath = config.checkouts?.path || '_records/';
	const checkoutTemplatePath =
		config.checkouts?.template || '.agents/domains/workspace/templates/checkout.art.njk';
	const recordsPattern = config.records?.pattern || '*.art';

	return {
		clone: {
			path: clonePath,
		},
		root: {
			path: rootPath,
		},
		checkouts: {
			path: checkoutsPath,
			template: checkoutTemplatePath,
		},
		records: {
			pattern: recordsPattern,
		},
	};
}
