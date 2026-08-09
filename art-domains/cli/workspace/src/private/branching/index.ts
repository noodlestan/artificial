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

export async function isDetachedHead(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		if (status.current && status.current !== 'HEAD') {
			return false;
		}
		try {
			const refOutput = await git.raw(['symbolic-ref', '-q', 'HEAD']);
			return !refOutput.trim();
		} catch {
			return true;
		}
	} catch {
		return false;
	}
}

export async function branchMatches(dir: string, expected: string): Promise<boolean> {
	const current = await getCurrentBranch(dir);
	return current === expected;
}
