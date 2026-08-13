export interface RepositoryRecord {
	name: string;
	purpose?: string;
	description?: string;
	remote: string;
	consumers?: string;
}

export interface RepositoryCheckoutRecord {
	repo?: RepositoryRecord;
	checkout: CheckoutRecord;
}

export interface CheckoutRecord {
	name: string;
	repository?: string;
	location: string;
	branch: string;
}

export interface PackageStateRecord {
	canonicalName: string;
	version: string | null;
	publishedVersion: string | null;
	directory: string;
	states: string[];
}

export interface ProjectRecord {
	name: string;
	path: string;
	namespaceNames: string[];
}

export interface NamespaceRecord {
	name: string;
	path: string;
	packageNames: string[];
}

export interface PackageRecord {
	name: string;
	canonicalName: string;
	path: string;
}

export interface ProjectGraph {
	projects: ProjectRecord[];
	namespaces: Map<string, NamespaceRecord>;
	packages: Map<string, PackageRecord>;
	warnings: string[];
}
