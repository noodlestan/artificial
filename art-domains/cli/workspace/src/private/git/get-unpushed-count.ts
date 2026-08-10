import simpleGit from 'simple-git';

export async function getUnpushedCount(dir: string): Promise<number> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		if (!status.current || status.current === 'HEAD') {
			return 0;
		}
		const branches = await git.branch();
		const tracking = branches.all.find(
			b => b === `origin/${status.current}` || b === `remotes/origin/${status.current}`,
		);
		if (!tracking) {
			return -1;
		}
		const ahead = await git.raw(['rev-list', '--count', `${tracking}..HEAD`]);
		return Number.parseInt(ahead.trim(), 10);
	} catch {
		return 0;
	}
}
