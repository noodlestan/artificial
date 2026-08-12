import { mkdirSync } from 'node:fs';

import simpleGit from 'simple-git';

export async function initBareRepo(dir: string): Promise<string> {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init(true);
	return dir;
}
