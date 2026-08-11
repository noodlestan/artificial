import type { RepositoryRecord } from '../config/types';

export interface Checkout {
	repo: RepositoryRecord;
	record: {
		name: string;
		location: string;
		branch: string;
	};
	exists: boolean;
	branch: string;
	remoteBranch: string | null;
	detached: boolean;
	conflicts: boolean;
	dirty: boolean;
	hasRemote: boolean;
	unpushed: number;
	issues: string[];
	extraneous: boolean;
}

export function createCheckout(repo: RepositoryRecord, location: string, branch: string): Checkout {
	return {
		repo,
		record: { name: repo.name, location, branch },
		exists: false,
		branch,
		remoteBranch: null,
		detached: false,
		conflicts: false,
		dirty: false,
		hasRemote: false,
		unpushed: 0,
		issues: [],
		extraneous: false,
	};
}
