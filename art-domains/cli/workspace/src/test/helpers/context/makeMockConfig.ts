import { WorkspaceConfig } from '../../../config';

export function makeMockConfig(
	rootPath: string,
	overrides?: Partial<WorkspaceConfig>,
): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		root: { path: rootPath },
		records: {
			repositories: { path: 'ops/records/repositories' },
			checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },
		},
		...overrides,
	};
}
