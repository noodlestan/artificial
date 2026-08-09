import { existsSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';

import type { VerifyNeeds } from '../types';

import type { RepositoryCheckout } from './types';

async function gitIsUpToDate(dir: string): Promise<boolean> {
	const git = simpleGit(dir);

	try {
		const status = await git.status();
		if (status.files.length > 0) {
			return false;
		}

		const remotes = await git.getRemotes(false);
		if (remotes.length === 0) {
			return false;
		}

		const currentBranch = status.current;
		if (!currentBranch || currentBranch === 'HEAD') {
			return false;
		}

		try {
			const branches = await git.branch();
			const tracking = branches.all.find(
				b => b === `origin/${currentBranch}` || b === `remotes/origin/${currentBranch}`,
			);
			if (!tracking) {
				return false;
			}

			const ahead = await git.raw(['rev-list', '--count', `${tracking}..HEAD`]);
			return Number.parseInt(ahead.trim(), 10) === 0;
		} catch {
			return false;
		}
	} catch {
		return false;
	}
}

export async function verifyCheckouts(
	checkouts: RepositoryCheckout[],
	needs: VerifyNeeds,
	root: string,
): Promise<RepositoryCheckout[]> {
	for (const checkout of checkouts) {
		if (needs.exists) {
			checkout.exists = existsSync(join(root, checkout.location));
		}

		if (needs.pushed) {
			const dir = join(root, checkout.location);
			if (!existsSync(dir)) {
				checkout.pushed = false;
			} else {
				checkout.pushed = await gitIsUpToDate(dir);
			}
		}
	}

	return checkouts;
}
