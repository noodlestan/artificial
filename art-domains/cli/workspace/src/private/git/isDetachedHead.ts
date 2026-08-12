import simpleGit from 'simple-git';

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
