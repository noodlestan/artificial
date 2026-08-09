export interface WorkspaceConfig {
	records: {
		workspace: WorkspaceRecord;
		repos: RepositoryRecord[];
	};
	checkouts: CheckoutConfig[];
}

export interface WorkspaceRecord {
	name: string;
	purpose: string;
	description?: string;
	remote: string;
	branch?: string;
}

export interface RepositoryRecord {
	name: string;
	purpose?: string;
	description?: string;
	remote: string;
	consumers?: string[];
}

export interface CheckoutConfig {
	repo: string;
	location: string;
	branch: string;
}

export interface RepositoryCheckout {
	repo: RepositoryRecord;
	location: string;
	branch: string;
	exists?: boolean;
	pushed?: boolean;
	published?: boolean;
}
