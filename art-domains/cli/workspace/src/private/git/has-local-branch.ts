import simpleGit from 'simple-git';

export async function hasLocalBranch(dir: string, branch: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const out = await git.raw(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]);
		return out.trim().length > 0;
	} catch {
		return false;
	}
}
