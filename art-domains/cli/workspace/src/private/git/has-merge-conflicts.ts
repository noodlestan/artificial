import simpleGit from 'simple-git';

export async function hasMergeConflicts(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		return status.conflicted.length > 0;
	} catch {
		return false;
	}
}
