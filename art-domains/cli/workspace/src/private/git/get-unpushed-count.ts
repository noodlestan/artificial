import simpleGit from 'simple-git';

export async function getUnpushedCount(dir: string, remoteBranch: string | null): Promise<number> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		if (!status.current || status.current === 'HEAD') {
			return 0;
		}
		if (remoteBranch) {
			const ahead = await git.raw(['rev-list', '--count', `${remoteBranch}..HEAD`]);
			return Number.parseInt(ahead.trim(), 10);
		}
		// New branch with no remote counterpart: count commits not reachable
		// from any remote-tracking branch.
		const ahead = await git.raw(['rev-list', '--count', 'HEAD', '--not', '--remotes=origin']);
		return Number.parseInt(ahead.trim(), 10);
	} catch {
		return 0;
	}
}
