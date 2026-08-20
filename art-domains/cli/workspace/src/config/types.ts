export type RecordFilePattern = string | RegExp;

export interface WorkspaceConfig {
	root: { path: string };
	clone: { path: string };
	checkouts: { path: string; template: string };
	records: {
		pattern: string;
		dotignored: string[];
		ignored: RecordFilePattern[];
		included: RecordFilePattern[];
	};
}

export interface PartialWorkspaceConfig {
	root?: Partial<WorkspaceConfig['root']>;
	clone?: Partial<WorkspaceConfig['clone']>;
	checkouts?: Partial<WorkspaceConfig['checkouts']>;
	records?: Partial<WorkspaceConfig['records']>;
}
