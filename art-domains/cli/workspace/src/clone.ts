import { join } from 'node:path';

import simpleGit from 'simple-git';

import { loadWorkspaceConfig } from './config';
import type { RepositoryRecord, WorkspaceConfig } from './config/types';
import { getCurrentBranch } from './private/branching';
import {
	loadCheckouts,
	readCheckoutRecord,
	saveCheckoutRecord,
} from './private/records/checkout-record';
import { loadRepositories } from './private/records/repository-record';
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

function resolveTarget(
	config: WorkspaceConfig,
	root: string,
	name: string,
	repos: RepositoryRecord[],
	checkouts: ReturnType<typeof loadCheckouts>,
): ResolvedTarget | null {
	const repo = repos.find(r => r.name === name);
	if (!repo) {
		console.warn(`clone: unknown repo "${name}", skipped`);
		return null;
	}

	const override = checkouts.find(c => c.repo.name === name);
	const location =
		override?.location ?? join(config.clone.path, name.toLowerCase().replace(/\s+/g, '-'));
	const branch = override?.branch ?? 'main';

	return { name, repo, location, branch };
}

async function cloneRepo(
	target: ResolvedTarget,
	root: string,
	config: WorkspaceConfig,
): Promise<CloneResult> {
	const recordFile = join(
		root,
		config.records.checkouts.path,
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
			saveCheckoutRecord(
				recordFile,
				{
					name: target.name,
					location,
					branch: actualBranch || branch,
				},
				config,
				root,
			);
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

	saveCheckoutRecord(
		recordFile,
		{
			name: target.name,
			location,
			branch: actualBranch,
		},
		config,
		root,
	);

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
	const repos = loadRepositories(config, root);
	const checkouts = loadCheckouts(config, root);

	let targets: ResolvedTarget[];
	if (!names || names.length === 0 || (names.length === 1 && names[0] === 'all')) {
		targets = repos
			.map(repo => resolveTarget(config, root, repo.name, repos, checkouts))
			.filter((t): t is ResolvedTarget => t !== null);
	} else {
		targets = names
			.map(name => resolveTarget(config, root, name, repos, checkouts))
			.filter((t): t is ResolvedTarget => t !== null);
	}

	if (targets.length === 0) {
		console.info('clone: no targets to clone');
		return;
	}

	const results: CloneResult[] = [];
	for (const target of targets) {
		const result = await cloneRepo(target, root, config);
		results.push(result);
	}

	console.info(formatResultsTable(results));

	const hasIssues = results.some(r => r.status === 'issue');
	if (hasIssues) {
		process.exitCode = 1;
	}
}
