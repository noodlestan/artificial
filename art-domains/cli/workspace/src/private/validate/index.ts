import { existsSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';

export function dirExists(root: string, location: string): boolean {
	return existsSync(join(root, location));
}

export async function isDirty(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		return status.files.length > 0;
	} catch {
		return false;
	}
}

export async function hasMergeConflicts(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		return status.conflicted.length > 0;
	} catch {
		return false;
	}
}

export async function hasRemote(dir: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		const remotes = await git.getRemotes(false);
		return remotes.length > 0;
	} catch {
		return false;
	}
}

export async function getUnpushedCount(dir: string): Promise<number> {
	const git = simpleGit(dir);
	try {
		const status = await git.status();
		if (!status.current || status.current === 'HEAD') {
			return 0;
		}
		const branches = await git.branch();
		const tracking = branches.all.find(
			b => b === `origin/${status.current}` || b === `remotes/origin/${status.current}`,
		);
		if (!tracking) {
			return 0;
		}
		const ahead = await git.raw(['rev-list', '--count', `${tracking}..HEAD`]);
		return Number.parseInt(ahead.trim(), 10);
	} catch {
		return 0;
	}
}

export async function isClean(dir: string): Promise<boolean> {
	const dirty = await isDirty(dir);
	return !dirty;
}
