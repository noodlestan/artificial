import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';

import { findRecordFiles } from './findRecordFiles';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('findRecordFiles', () => {
	it('finds *.art files recursively with default pattern', () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, 'sub'), { recursive: true });
		writeFileSync(join(tempDir, 'sub/nested.art'), '# Nested');

		const results = findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(2);
		expect(results).toContain(join(tempDir, 'root.art'));
		expect(results).toContain(join(tempDir, 'sub/nested.art'));
	});

	it('respects a custom pattern', () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'foo.art'), '# Art');
		writeFileSync(join(tempDir, 'bar.md'), '# Markdown');

		const results = findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(1);
		expect(results).toContain(join(tempDir, 'foo.art'));
	});

	it('returns empty array for missing path', () => {
		const results = findRecordFiles('/nonexistent/path', '*.art');
		expect(results).toEqual([]);
	});

	it('excludes .git directories', () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, '.git/objects'), { recursive: true });
		writeFileSync(join(tempDir, '.git/config'), '[core]');

		const results = findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(1);
		expect(results).toContain(join(tempDir, 'root.art'));
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

		const results = findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(1);
		expect(results).toContain(join(tempDir, 'root.art'));
	});

	it('returns all files without git filtering when not in a git repo', () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, '.gitignore'), 'ignored/\n');
		writeFileSync(join(tempDir, 'root.art'), '# Root');
		mkdirSync(join(tempDir, 'ignored'), { recursive: true });
		writeFileSync(join(tempDir, 'ignored/skip.art'), '# Skip');

		const results = findRecordFiles(tempDir, '*.art');

		expect(results).toHaveLength(2);
	});

	it('returns deterministic sorted output', () => {
		const tempDir = makeTempDir(tempDirs);
		writeFileSync(join(tempDir, 'c.art'), '# C');
		writeFileSync(join(tempDir, 'a.art'), '# A');
		writeFileSync(join(tempDir, 'b.art'), '# B');

		const results = findRecordFiles(tempDir, '*.art');

		expect(results).toEqual([
			join(tempDir, 'a.art'),
			join(tempDir, 'b.art'),
			join(tempDir, 'c.art'),
		]);
	});

	it('returns empty array when search path is a file not a directory', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'not-a-dir.txt');
		writeFileSync(file, 'hello');

		const results = findRecordFiles(file, '*.art');

		expect(results).toEqual([]);
	});
});
