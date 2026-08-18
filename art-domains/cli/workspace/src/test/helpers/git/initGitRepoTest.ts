import { mkdirSync } from 'node:fs';

import simpleGit from 'simple-git';

export async function initGitRepoTest(
	dir: string,
	opts?: { withRemote?: boolean; bareDir?: string },
): Promise<void> {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init();
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	if (opts?.withRemote && opts?.bareDir) {
		const bareGit = simpleGit(opts.bareDir);
		await bareGit.init(true);
		await git.addRemote('origin', opts.bareDir);
	}
}
