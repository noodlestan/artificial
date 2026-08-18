import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';

export async function initWorkingRepoTest(dir: string, bareDir: string): Promise<void> {
	mkdirSync(dir, { recursive: true });
	const git = simpleGit(dir);
	await git.init();
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	await git.addRemote('origin', bareDir);
	writeFileSync(join(dir, 'README.md'), '# Test');

	const bareGit = simpleGit(bareDir);
	await bareGit.init(true);

	await git.add('.');
	await git.commit('initial');
	await git.push('origin', 'main', ['--set-upstream']);
}
