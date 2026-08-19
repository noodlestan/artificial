import { WorkspaceConfig } from '../../../config';

export function makeMockConfig(
	rootPath: string,
	overrides?: Partial<WorkspaceConfig>,
): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		root: { path: rootPath },
		checkouts: { path: '_records/', template: 'checkout.art.njk' },
		records: { pattern: '*.art' },
		...overrides,
	};
}
