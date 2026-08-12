export interface WorkspaceConfig {
	clone: {
		path: string;
	};
	root: {
		path: string;
	};
	records: {
		repositories: {
			path: string;
		};
		checkouts: {
			path: string;
			template: string;
		};
	};
}

export interface PartialWorkspaceConfig {
	clone?: Partial<WorkspaceConfig['clone']>;
	root?: Partial<WorkspaceConfig['root']>;
	records?: {
		repositories?: Partial<WorkspaceConfig['records']['repositories']>;
		checkouts?: Partial<WorkspaceConfig['records']['checkouts']>;
	};
}
