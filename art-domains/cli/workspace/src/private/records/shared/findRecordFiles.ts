import { execFileSync } from 'node:child_process';
import { existsSync, globSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function findRecordFiles(searchPath: string, pattern: string): string[] {
	if (!existsSync(searchPath)) {
		return [];
	}

	let stat;
	try {
		stat = statSync(searchPath);
		if (!stat.isDirectory()) {
			return [];
		}
	} catch {
		return [];
	}

	const normalizedPattern = pattern.includes('**') ? pattern : `**/${pattern}`;
	const globPattern = join(searchPath, normalizedPattern);

	let candidates: string[];
	try {
		const entries = globSync(globPattern, { withFileTypes: true });
		candidates = entries
			.filter(entry => !entry.isDirectory())
			.map(entry => resolve(entry.parentPath, entry.name));
	} catch {
		return [];
	}

	const filtered = candidates.filter(filePath => {
		const relative = filePath.slice(searchPath.length + 1);
		if (relative.split('/').includes('.git')) {
			return false;
		}
		return true;
	});

	let ignored: Set<string>;
	try {
		const input = filtered.join('\n');
		const output = execFileSync('git', ['check-ignore', '--no-index', '--stdin'], {
			input,
			cwd: searchPath,
			encoding: 'utf-8',
			timeout: 5000,
			stdio: ['pipe', 'pipe', 'ignore'],
		});
		ignored = new Set(
			output
				.split('\n')
				.filter(Boolean)
				.map(line => resolve(searchPath, line)),
		);
	} catch (error: unknown) {
		const status =
			error instanceof Error && 'status' in error
				? (error as { status?: number }).status
				: undefined;
		if (status === 128) {
			return filtered.sort();
		}
		ignored = new Set();
	}

	const result = filtered.filter(filePath => !ignored.has(filePath));
	return result.sort();
}
