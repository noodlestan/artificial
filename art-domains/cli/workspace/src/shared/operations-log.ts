export interface Operation {
	ts: Date;
	repo: string;
	operation: string;
	detail: string;
}

export interface OperationsLog {
	operations: Operation[];
	cloned(repo: string, detail: string): void;
	pushed(repo: string, detail: string): void;
	published(repo: string, detail: string): void;
	branchCreated(repo: string, detail: string): void;
	linked(repo: string, detail: string): void;
	unlinked(repo: string, detail: string): void;
	all(): Operation[];
	since(ts: Date): Operation[];
	latest(n: number): Operation[];
}

export function createOperationsLog(): OperationsLog {
	const operations: Operation[] = [];

	function add(operation: string, repo: string, detail: string): void {
		operations.push({ ts: new Date(), repo, operation, detail });
	}

	return {
		operations,

		cloned(repo: string, detail: string): void {
			add('cloned', repo, detail);
		},

		pushed(repo: string, detail: string): void {
			add('pushed', repo, detail);
		},

		published(repo: string, detail: string): void {
			add('published', repo, detail);
		},

		branchCreated(repo: string, detail: string): void {
			add('branch created', repo, detail);
		},

		linked(repo: string, detail: string): void {
			add('linked', repo, detail);
		},

		unlinked(repo: string, detail: string): void {
			add('unlinked', repo, detail);
		},

		all(): Operation[] {
			return [...operations];
		},

		since(ts: Date): Operation[] {
			return operations.filter(op => op.ts > ts);
		},

		latest(n: number): Operation[] {
			return operations.slice(-n);
		},
	};
}
