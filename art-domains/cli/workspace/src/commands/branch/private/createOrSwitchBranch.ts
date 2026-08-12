import simpleGit from 'simple-git';

import { hasLocalBranch } from '../../../private/git/hasLocalBranch';

export async function createOrSwitchBranch(
	dir: string,
	branch: string,
): Promise<'created' | 'switched'> {
	const git = simpleGit(dir);
	if (await hasLocalBranch(dir, branch)) {
		await git.checkout(branch);
		return 'switched';
	}
	await git.checkoutLocalBranch(branch);
	return 'created';
}
