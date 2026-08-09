import { join } from 'node:path';

import simpleGit from 'simple-git';

import { loadWorkspaceConfig } from './config';
import type { RepositoryRecord, WorkspaceConfig } from './config/types';
import { getCurrentBranch } from './private/branching';
import { readCheckoutRecord, saveCheckoutRecord } from './private/records/checkout-record';
import { dirExists, isDirty } from './private/validate';

interface CloneOptions {
	root: string;
	names?: string[];
}

interface CloneResult {
	name: string;
	location: string;
	branch: string;
	status: 'cloned' | 'exists' | 'issue';
	issues: string[];
}

interface ResolvedTarget {
	name: string;
	repo: RepositoryRecord;
	location: string;
	branch: string;
}

function resolveTarget(config: WorkspaceConfig, name: string): ResolvedTarget | null {
	const repo = config.records.repos.find(r => r.name === name);
	if (!repo) {
		console.warn(`clone: unknown repo "${name}", skipped`);
		return null;
	}

	const declared = config.checkouts.find(c => c.repo === name);
	const location = declared?.location ?? `repos/${name.toLowerCase().replace(/\s+/g, '-')}`;
	const branch = declared?.branch ?? 'main';

	return { name, repo, location, branch };
}

async function cloneRepo(target: ResolvedTarget, root: string): Promise<CloneResult> {
	const recordFile = join(
		root,
		'ops/records/checkouts',
		`${target.name.toLowerCase().replace(/\s+/g, '-')}.art`,
	);
	const record = readCheckoutRecord(recordFile);

	const location = record.location || target.location;
	const branch = record.branch || target.branch;
	const dir = join(root, location);

	if (!dirExists(root, location)) {
		const git = simpleGit(root);
		try {
			await git.clone(target.repo.remote, location);
			const actualBranch = await getCurrentBranch(dir);
			saveCheckoutRecord(recordFile, {
				name: target.name,
				location,
				branch: actualBranch || branch,
			});
			return {
				name: target.name,
				location,
				branch: actualBranch || branch,
				status: 'cloned',
				issues: [],
			};
		} catch (err) {
			return {
				name: target.name,
				location,
				branch,
				status: 'issue',
				issues: [`clone failed: ${err instanceof Error ? err.message : String(err)}`],
			};
		}
	}

	const dirty = await isDirty(dir);
	if (dirty) {
		return {
			name: target.name,
			location,
			branch,
			status: 'issue',
			issues: ['dirty working tree'],
		};
	}

	const actualBranch = await getCurrentBranch(dir);
	if (actualBranch !== branch) {
		return {
			name: target.name,
			location,
			branch: actualBranch,
			status: 'issue',
			issues: [`branch mismatch: expected "${branch}", found "${actualBranch}"`],
		};
	}

	saveCheckoutRecord(recordFile, {
		name: target.name,
		location,
		branch: actualBranch,
	});

	return {
		name: target.name,
		location,
		branch: actualBranch,
		status: 'exists',
		issues: [],
	};
}

function formatResultsTable(results: CloneResult[]): string {
	const headers = ['repo', 'location', 'branch', 'status', 'issues'];
	const data = results.map(r => [
		r.name,
		r.location,
		r.branch,
		r.status,
		r.issues.join('; ') || '-',
	]);

	const allRows = [headers, ...data];
	const colWidths = headers.map((_, colIdx) =>
		Math.max(...allRows.map(row => String(row[colIdx]).length)),
	);

	const lines = allRows.map(row =>
		row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('  '),
	);

	return lines.join('\n');
}

export async function runClone({ root, names }: CloneOptions): Promise<void> {
	const config = await loadWorkspaceConfig(root);

	let targets: ResolvedTarget[];
	if (!names || names.length === 0 || (names.length === 1 && names[0] === 'all')) {
		targets = config.records.repos
			.map(repo => resolveTarget(config, repo.name))
			.filter((t): t is ResolvedTarget => t !== null);
	} else {
		targets = names
			.map(name => resolveTarget(config, name))
			.filter((t): t is ResolvedTarget => t !== null);
	}

	if (targets.length === 0) {
		console.info('clone: no targets to clone');
		return;
	}

	const results: CloneResult[] = [];
	for (const target of targets) {
		const result = await cloneRepo(target, root);
		results.push(result);
	}

	console.info(formatResultsTable(results));

	const hasIssues = results.some(r => r.status === 'issue');
	if (hasIssues) {
		process.exitCode = 1;
	}
}
