export interface WorkspaceConfig {
	records: {
		/** Workspace record data — mirrors Structure: Workspace (ops/records/workspace.art). */
		workspace: WorkspaceRecord;
		/** Repository record data — one entry per repo, mirrors Structure: Repository (ops/records/repositories/*.art). */
		repos: RepositoryRecord[];
	};
}

/** Mirrors Structure: Workspace. */
export interface WorkspaceRecord {
	name: string;
	purpose: string;
	description?: string;
	remote: string;
	branch?: string;
}

/** Mirrors Structure: Repository. */
export interface RepositoryRecord {
	name: string;
	purpose?: string;
	description?: string;
	remote: string;
	checkout?: string;
	branch?: string;
	consumers?: string[];
}

/** A checkout derived from the records at entry point (locateCheckouts). */
export interface RepositoryCheckout {
	/** The repository record this checkout refers to (carries the remote). */
	repo: RepositoryRecord;
	/** Filesystem location on the workspace (workspace-relative for now). Copied from repo.checkout. */
	location: string;
	/** Default branch for this checkout. Initialised from repo.branch for now. */
	branch: string;
	/** Runtime state — filled by verification (verifyCheckouts) only when a use case needs it. */
	exists?: boolean;
	pushed?: boolean;
	published?: boolean;
}
