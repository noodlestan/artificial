import simpleGit from 'simple-git';

export async function cloneRepo(location: string, remote: string): Promise<boolean> {
	const git = simpleGit('');
	try {
		await git.clone(remote, location);
		return true;
	} catch {
		return false;
	}
}
