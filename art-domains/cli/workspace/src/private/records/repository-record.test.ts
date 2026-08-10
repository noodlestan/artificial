import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceConfig } from '../../config/types';

import { loadRepositories, readRepositoryRecord } from './repository-record';

const tempDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), 'art-repo-record-test-'));
	tempDirs.push(dir);
	return dir;
}

function makeConfig(repoPath: string): WorkspaceConfig {
	return {
		clone: { path: 'repos' },
		records: {
			repositories: { path: repoPath },
			checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },
		},
	};
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
	vi.restoreAllMocks();
});

describe('readRepositoryRecord', () => {
	it('parses name, remote, purpose, description, and consumers from a record file', () => {
		const root = makeTempDir();
		const file = join(root, 'artificial.art');
		writeFileSync(
			file,
			`# Module

## Repository: Artificial

**Purpose:** Art Language and artisan toolchain.

**Description:** The second repository.

**Remote:** \`git@github.com:noodlestan/artificial.git\`

**Consumers:** purrception, no-comply
`,
		);

		const record = readRepositoryRecord(file);

		expect(record.name).toBe('Artificial');
		expect(record.remote).toBe('git@github.com:noodlestan/artificial.git');
		expect(record.purpose).toBe('Art Language and artisan toolchain.');
		expect(record.description).toBe('The second repository.');
		expect(record.consumers).toBe('purrception, no-comply');
	});

	it('returns defaults for a missing file', () => {
		const root = makeTempDir();
		const record = readRepositoryRecord(join(root, 'missing.art'));

		expect(record.name).toBe('');
		expect(record.remote).toBe('');
	});

	it('warns and uses defaults for missing remote', () => {
		const root = makeTempDir();
		const file = join(root, 'norepo.art');
		writeFileSync(file, '# Module\n\n## Repository: NoRemote\n\n**Purpose:** test\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const record = readRepositoryRecord(file);

		expect(record.name).toBe('NoRemote');
		expect(record.remote).toBe('');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing remote'));
	});
});

describe('loadRepositories', () => {
	it('loads all .art files from the repositories path', () => {
		const root = makeTempDir();
		const dir = join(root, 'ops/records/repositories');
		mkdirSync(dir, { recursive: true });

		for (let i = 0; i < 7; i++) {
			writeFileSync(
				join(dir, `repo${i}.art`),
				`## Repository: Repo${i}\n\n**Remote:** \`git@example.com:repo${i}.git\`\n`,
			);
		}

		const config = makeConfig('ops/records/repositories');
		const repos = loadRepositories(config, root);

		expect(repos).toHaveLength(7);
	});

	it('ignores non-.art files', () => {
		const root = makeTempDir();
		const dir = join(root, 'ops/records/repositories');
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, 'repo.art'),
			'## Repository: Repo\n\n**Remote:** `git@example.com:repo.git`\n',
		);
		writeFileSync(join(dir, 'readme.md'), '# Not a record');

		const config = makeConfig('ops/records/repositories');
		const repos = loadRepositories(config, root);

		expect(repos).toHaveLength(1);
		expect(repos[0].name).toBe('Repo');
	});

	it('warns and includes malformed records with defaults', () => {
		const root = makeTempDir();
		const dir = join(root, 'ops/records/repositories');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'malformed.art'), '# Module\n\nNo valid fields here\n');

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const config = makeConfig('ops/records/repositories');
		const repos = loadRepositories(config, root);

		expect(repos).toHaveLength(1);
		expect(repos[0].name).toBe('');
		expect(repos[0].remote).toBe('');
		expect(warn).toHaveBeenCalled();
	});

	it('returns empty array when directory does not exist', () => {
		const root = makeTempDir();
		const config = makeConfig('ops/records/repositories');
		const repos = loadRepositories(config, root);

		expect(repos).toEqual([]);
	});
});
