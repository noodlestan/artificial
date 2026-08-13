import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { removeTempDirs } from '../../../test/removeTempDirs';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('readProjectRecord', () => {
	it.todo('parses a valid project record');
	it.todo('returns null for a missing file');
	it.todo('returns null for an invalid file');
});

describe('readProjectRecords', () => {
	it.todo('reads multiple project records from a directory');
	it.todo('returns empty array for a missing directory');
	it.todo('filters out invalid records');
});

describe('readNamespaceRecord', () => {
	it.todo('parses a valid namespace record');
	it.todo('returns null for a missing file');
	it.todo('returns null for an invalid file');
});

describe('readNamespaceRecords', () => {
	it.todo('reads multiple namespace records from a directory');
	it.todo('returns empty array for a missing directory');
	it.todo('filters out invalid records');
});

describe('readPackageRecord', () => {
	it.todo('parses a valid package record');
	it.todo('returns null for a missing file');
	it.todo('returns null for an invalid file');
});

describe('readPackageRecords', () => {
	it.todo('reads multiple package records from a directory');
	it.todo('returns empty array for a missing directory');
	it.todo('filters out invalid records');
});

describe('consolidateProjectGraph', () => {
	it.todo('links projects to namespaces and packages');
	it.todo('warns on missing namespace references');
	it.todo('warns on missing package references');
});

describe('loadProjectGraph', () => {
	it.todo('loads a complete project graph from a checkout');
	it.todo('returns empty graph for a checkout without records');
});
