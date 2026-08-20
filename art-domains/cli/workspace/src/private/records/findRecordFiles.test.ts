import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { findRecordFiles } from './findRecordFiles';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('findRecordFiles', () => {
	it('finds *.art files recursively with default pattern', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, 'sub'), { recursive: true });
		writeFileSync(join(tempDir, 'sub/nested.art'), '# Nested');

		const results = await findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(2);
		expect(results.map(file => file.filename)).toContain(join(tempDir, 'root.art'));
		expect(results.map(file => file.filename)).toContain(join(tempDir, 'sub/nested.art'));
		expect(results[0]).toMatchObject({
			searchPath: tempDir,
			path: 'root.art',
		});
	});

	it('respects a custom pattern', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'foo.art'), '# Art');
		writeFileSync(join(tempDir, 'bar.md'), '# Markdown');

		const results = await findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(1);
		expect(results[0]?.filename).toBe(join(tempDir, 'foo.art'));
	});

	it('filters files by record kind', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'project.art'), '## Project: artificial\n');
		writeFileSync(join(tempDir, 'namespace.art'), '## Namespace: art-domains\n');
		writeFileSync(join(tempDir, 'decoy.art'), '## Resource: unrelated\n');

		const results = await findRecordFiles(tempDir, '*.art', 'Project');

		expect(results.map(file => file.filename)).toEqual([join(tempDir, 'project.art')]);
	});

	it('matches any of multiple record kinds', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'project.art'), '## Project: artificial\n');
		writeFileSync(join(tempDir, 'namespace.art'), '## Namespace: art-domains\n');
		writeFileSync(join(tempDir, 'decoy.art'), '## Resource: unrelated\n');

		const results = await findRecordFiles(tempDir, '*.art', ['Namespace', 'Project']);

		expect(results.map(file => file.filename)).toEqual([
			join(tempDir, 'namespace.art'),
			join(tempDir, 'project.art'),
		]);
	});

	it('applies configured ignored and included patterns', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'keep.art'), '# Keep');
		writeFileSync(join(tempDir, 'skip.art'), '# Skip');

		const results = await findRecordFiles(tempDir, '*.art', [], {
			pattern: '*.art',
			dotignored: [],
			ignored: ['skip.art'],
			included: [],
		});

		expect(results.map(file => file.filename)).toEqual([join(tempDir, 'keep.art')]);
	});

	it('can disable Git-ignore filtering', async () => {
		const tempDir = makeTempDir(tempDirs);
		const git = simpleGit(tempDir);
		await git.init();
		writeFileSync(join(tempDir, '.gitignore'), 'ignored/\n');
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, 'ignored'), { recursive: true });
		writeFileSync(join(tempDir, 'ignored/skip.art'), '# Skip');

		const results = await findRecordFiles(tempDir, '*.art', [], {
			pattern: '*.art',
			dotignored: [],
			ignored: [],
			included: [],
		});

		expect(results).toHaveLength(2);
	});

	it('returns empty array for missing path', async () => {
		const results = await findRecordFiles('/nonexistent/path', '*.art');
		expect(results).toEqual([]);
	});

	it('excludes .git directories', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, '.git/objects'), { recursive: true });
		writeFileSync(join(tempDir, '.git/config'), '[core]');

		const results = await findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(1);
		expect(results[0]?.filename).toBe(join(tempDir, 'root.art'));
	});

	it('excludes files matching .gitignore when in a git repo', async () => {
		const tempDir = makeTempDir(tempDirs);
		const git = simpleGit(tempDir);
		await git.init();
		await git.addConfig('user.email', 'test@test.com');
		await git.addConfig('user.name', 'Test');
		writeFileSync(join(tempDir, '.gitignore'), 'ignored/\n');
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, 'ignored'), { recursive: true });
		writeFileSync(join(tempDir, 'ignored/skip.art'), '# Skip');

		const results = await findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(1);
		expect(results[0]?.filename).toBe(join(tempDir, 'root.art'));
	});

	it('returns all files without git filtering when not in a git repo', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, '.gitignore'), 'ignored/\n');
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, 'ignored'), { recursive: true });
		writeFileSync(join(tempDir, 'ignored/skip.art'), '# Skip');

		const results = await findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(2);
	});

	it('returns deterministic sorted output', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'c.art'), '# C');
		writeFileSync(join(tempDir, 'a.art'), '# A');
		writeFileSync(join(tempDir, 'b.art'), '# B');

		const results = await findRecordFiles(tempDir, '*.art');

		expect(results.map(file => file.filename)).toEqual([
			join(tempDir, 'a.art'),
			join(tempDir, 'b.art'),
			join(tempDir, 'c.art'),
		]);
	});

	it('returns empty array when search path is a file not a directory', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'not-a-dir.txt');
		writeFileSync(file, 'hello');

		const results = await findRecordFiles(file, '*.art');

		expect(results).toEqual([]);
	});
});
