export function doesIssueBlockPush(issue: string): boolean {
	return (
		issue.includes('uncommitted') ||
		issue.includes('merge conflicts') ||
		issue.includes('detached HEAD')
	);
}
