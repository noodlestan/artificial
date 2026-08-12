import simpleGit from 'simple-git';

export async function getCurrentBranch(dir: string): Promise<string> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		const branch = status.current ?? 'HEAD';
		if (!status.current || status.current === 'HEAD') {
			try {
				const refOutput = await git.raw(['symbolic-ref', '-q', 'HEAD']);
				if (!refOutput.trim()) {
					return 'HEAD';
				}
			} catch {
				return 'HEAD';
			}
		}
		return branch;
	} catch {
		return '-';
	}
}
