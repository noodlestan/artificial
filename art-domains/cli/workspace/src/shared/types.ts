export interface VerifyNeeds {
	exists?: boolean;
	pushed?: boolean;
	published?: boolean;
}

export interface RepoStatus {
	name: string;
	location: string;
	branch: string;
	issues: string[];
	pushed: 'no' | 'now' | 'yes';
	exists: boolean;
}
