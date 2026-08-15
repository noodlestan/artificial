import simpleGit from 'simple-git';

export async function getBehindCount(dir: string, remoteBranch: string): Promise<number> {
	const git = simpleGit(dir);
	try {
		const behind = await git.raw(['rev-list', '--count', `HEAD..${remoteBranch}`]);
		return Number.parseInt(behind.trim(), 10);
	} catch {
		return 0;
	}
}
