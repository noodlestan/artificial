import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';

import { makeTempDir } from './makeTempDir';

export async function makeOriginAhead(bareDir: string, tempDirs: string[]): Promise<void> {
	const otherDir = makeTempDir(tempDirs);
	await simpleGit(otherDir).clone(bareDir, otherDir);
	const git = simpleGit(otherDir);
	await git.addConfig('user.email', 'test@example.com');
	await git.addConfig('user.name', 'Test');
	writeFileSync(join(otherDir, 'origin.txt'), 'origin');
	await git.add('.');
	await git.commit('origin change');
	await git.push('origin', 'main');
}
