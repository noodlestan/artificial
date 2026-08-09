import { join } from 'node:path';

import simpleGit from 'simple-git';

import { loadWorkspaceConfig, locateCheckouts, verifyCheckouts } from './config';

interface SanityOptions {
	root: string;
	auto: boolean;
}

interface RepoStatus {
	name: string;
	location: string;
	branch: string;
	issues: string[];
	pushed: 'no' | 'now' | 'yes';
	exists: boolean;
}

async function getRepoStatus(
	location: string,
	root: string,
	exists: boolean,
	initialPushed: boolean | undefined,
): Promise<RepoStatus> {
	const name = location.split('/').pop() ?? location;
	const dir = join(root, location);

	if (!exists) {
		return {
			name,
			location,
			branch: '-',
			issues: ['repo not cloned'],
			pushed: 'no',
			exists: false,
		};
	}

	const git = simpleGit(dir);
	const issues: string[] = [];
	let branch = '-';
	let dirty = false;
	let unpushedCount = 0;
	let hasRemote = false;
	let detachedHead = false;
	let mergeConflicts = false;

	try {
		const status = await git.status();

		branch = status.current ?? 'HEAD';
		if (!status.current || status.current === 'HEAD') {
			try {
				const refOutput = await git.raw(['symbolic-ref', '-q', 'HEAD']);
				if (!refOutput.trim()) {
					detachedHead = true;
				}
			} catch {
				detachedHead = true;
			}
		}

		if (status.conflicted.length > 0) {
			mergeConflicts = true;
		}

		if (status.files.length > 0) {
			dirty = true;
		}

		const remotes = await git.getRemotes(false);
		hasRemote = remotes.length > 0;

		if (hasRemote && status.current && status.current !== 'HEAD') {
			try {
				const branches = await git.branch();
				const tracking = branches.all.find(
					b => b === `origin/${status.current}` || b === `remotes/origin/${status.current}`,
				);
				if (tracking) {
					const ahead = await git.raw(['rev-list', '--count', `${tracking}..HEAD`]);
					unpushedCount = Number.parseInt(ahead.trim(), 10);
				}
			} catch {
				// no tracking branch
			}
		}
	} catch {
		issues.push('git error');
	}

	if (detachedHead) {
		issues.push('detached HEAD');
	}
	if (mergeConflicts) {
		issues.push('merge conflicts');
	}
	if (!hasRemote) {
		issues.push('no remote');
	}
	if (dirty) {
		try {
			const status = await git.status();
			const dirtyCount = status.files.length;
			issues.push(`${dirtyCount} uncommitted file${dirtyCount !== 1 ? 's' : ''}`);
		} catch {
			issues.push('uncommitted files');
		}
	}
	if (unpushedCount > 0) {
		issues.push(`${unpushedCount} commit${unpushedCount !== 1 ? 's' : ''} ahead`);
	}

	let pushed: 'no' | 'now' | 'yes';
	if (!hasRemote) {
		pushed = 'no';
	} else if (initialPushed) {
		pushed = 'yes';
	} else {
		pushed = 'no';
	}

	return {
		name,
		location,
		branch,
		issues,
		pushed,
		exists: true,
	};
}

function formatTable(rows: RepoStatus[]): string {
	const headers = ['repo/directory', 'branch', 'issues', 'pushed?'];
	const data = rows.map(r => [r.location, r.branch, r.issues.join('; ') || 'clean', r.pushed]);

	const allRows = [headers, ...data];
	const colWidths = headers.map((_, colIdx) =>
		Math.max(...allRows.map(row => String(row[colIdx]).length)),
	);

	const lines = allRows.map(row =>
		row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('  '),
	);

	return lines.join('\n');
}

export async function runSanity({ root, auto }: SanityOptions): Promise<void> {
	const config = await loadWorkspaceConfig(root);
	const checkouts = locateCheckouts(config);
	await verifyCheckouts(checkouts, { exists: true, pushed: true }, root);

	const statuses: RepoStatus[] = [];
	for (const checkout of checkouts) {
		const status = await getRepoStatus(
			checkout.location,
			root,
			checkout.exists ?? false,
			checkout.pushed,
		);
		statuses.push(status);
	}

	if (auto) {
		for (const status of statuses) {
			if (!status.exists) continue;
			if (
				status.issues.some(
					i =>
						i.includes('uncommitted') ||
						i.includes('merge conflicts') ||
						i.includes('detached HEAD'),
				)
			)
				continue;
			if (status.pushed !== 'no') continue;
			if (status.issues.some(i => i.includes('no remote'))) continue;

			const dir = join(root, status.location);
			const git = simpleGit(dir);
			try {
				await git.push('origin', status.branch);
				status.pushed = 'now';
				status.issues = status.issues.filter(i => !/\d+ commit/.test(i));
			} catch {
				// push failed, leave as 'no'
			}
		}
	}

	const nonGreen = statuses.filter(s => {
		if (!s.exists) return true;
		if (s.issues.length > 0) return true;
		if (s.pushed !== 'yes' && s.pushed !== 'now') return true;
		return false;
	});

	if (nonGreen.length === 0) {
		// eslint-disable-next-line no-console
		console.log('All repos are green \u2713');
	} else {
		// eslint-disable-next-line no-console
		console.log(formatTable(nonGreen));
	}
}
