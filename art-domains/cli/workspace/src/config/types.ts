export interface WorkspaceConfig {
	clone: {
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

export interface RepositoryRecord {
	name: string;
	purpose?: string;
	description?: string;
	remote: string;
	consumers?: string;
}

export interface RepositoryCheckout {
	repo: RepositoryRecord;
	location: string;
	branch: string;
	exists?: boolean;
	pushed?: boolean;
	published?: boolean;
}
