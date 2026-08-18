import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';

export async function commitFileTest(
	dir: string,
	filename: string,
	content = 'content',
): Promise<void> {
	writeFileSync(join(dir, filename), content);
	const git = simpleGit(dir);
	await git.add('.');
	await git.commit('add ' + filename);
}
