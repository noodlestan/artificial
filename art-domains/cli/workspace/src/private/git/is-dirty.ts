import simpleGit from 'simple-git';

export async function isDirty(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		return status.files.length > 0;
	} catch {
		return false;
	}
}
