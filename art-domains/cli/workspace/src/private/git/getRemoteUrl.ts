import simpleGit from 'simple-git';

export async function getRemoteUrl(dir: string): Promise<string | null> {
	const git = simpleGit(dir);
	try {
		const config = await git.listConfig();
		const url = config.all['remote.origin.url'];
		if (typeof url === 'string') return url;
		if (Array.isArray(url) && url.length > 0) return url[0];
		return null;
	} catch {
		return null;
	}
}
