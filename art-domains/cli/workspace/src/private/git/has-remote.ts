import simpleGit from 'simple-git';

export async function hasRemote(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const remotes = await git.getRemotes(false);
		return remotes.length > 0;
	} catch {
		return false;
	}
}
