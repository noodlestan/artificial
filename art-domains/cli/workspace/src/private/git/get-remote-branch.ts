import simpleGit from 'simple-git';

export async function getRemoteBranch(dir: string): Promise<string | null> {
	const git = simpleGit(dir);
	try {
		const branches = await git.branch();
		const current = branches.current;
		if (!current || current === 'HEAD') {
			return null;
		}
		const tracking = branches.all.find(
			b => b === `origin/${current}` || b === `remotes/origin/${current}`,
		);
		return tracking ? tracking.replace(/^remotes\//, '') : null;
	} catch {
		return null;
	}
}
