export interface RepoStatus {
	name: string;
	location: string;
	branch: string;
	issues: string[];
	pushed: 'no' | 'now' | 'yes';
	exists: boolean;
}
