import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeTempDir } from '../../../test/makeTempDir';
import { removeTempDirs } from '../../../test/removeTempDirs';
import {
	writeNamespaceRecord,
	writePackageRecord,
	writeProjectRecord,
} from '../../../test/writeProjectRecord';
import { readNamespaceRecord } from '../namespace/readNamespaceRecord';
import { readNamespaceRecords } from '../namespace/readNamespaceRecords';
import { readPackageRecord } from '../package/readPackageRecord';
import { readPackageRecords } from '../package/readPackageRecords';
import { readProjectRecord } from '../project/readProjectRecord';
import { readProjectRecords } from '../project/readProjectRecords';

import { consolidateProjectGraph } from './consolidateProjectGraph';
import { loadProjectGraph } from './loadProjectGraph';

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('readProjectRecord', () => {
	it('parses a valid project record', () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectRecord(tempDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: 'artisans',
			namespaces: ['Art Domains', 'Art Tools'],
		});

		const file = join(tempDir, 'ops/records/projects/artificial.art');
		const record = readProjectRecord(file);

		expect(record).not.toBeNull();
		expect(record?.kind).toBe('project');
		expect(record?.name).toBe('Artificial');
		expect(record?.path).toBe('artisans');
		expect(record?.namespaceNames).toEqual(['Art Domains', 'Art Tools']);
	});

	it('returns null for a missing file', () => {
		const record = readProjectRecord('/nonexistent/file.art');
		expect(record).toBeNull();
	});

	it('returns null for an invalid file', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'bad.art');
		writeFileSync(file, 'no project heading here');

		const record = readProjectRecord(file);
		expect(record).toBeNull();
	});
});

describe('readProjectRecords', () => {
	it('reads multiple project records from a directory', () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectRecord(tempDir, 'Project A', { path: '.' });
		writeProjectRecord(tempDir, 'Project B', { path: 'b' });

		const records = readProjectRecords(join(tempDir, 'ops/records'));
		expect(records).toHaveLength(2);
		expect(records.map(r => r.name).sort()).toEqual(['Project A', 'Project B']);
	});

	it('returns empty array for a missing directory', () => {
		const records = readProjectRecords('/nonexistent/dir');
		expect(records).toEqual([]);
	});

	it('filters out invalid records', () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectRecord(tempDir, 'Good', { path: '.' });

		const badDir = join(tempDir, 'ops/records/projects');
		mkdirSync(badDir, { recursive: true });
		writeFileSync(join(badDir, 'bad.art'), 'no heading');

		const records = readProjectRecords(join(tempDir, 'ops/records'));
		expect(records).toHaveLength(1);
		expect(records[0].name).toBe('Good');
	});
});

describe('readNamespaceRecord', () => {
	it('parses a valid namespace record', () => {
		const tempDir = makeTempDir(tempDirs);
		writeNamespaceRecord(tempDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras', 'Art Tools'],
		});

		const file = join(tempDir, 'ops/records/namespaces/art-domains.art');
		const record = readNamespaceRecord(file);

		expect(record).not.toBeNull();
		expect(record?.kind).toBe('namespace');
		expect(record?.name).toBe('Art Domains');
		expect(record?.path).toBe('artisans');
		expect(record?.packageNames).toEqual(['Art Mantras', 'Art Tools']);
	});

	it('returns null for a missing file', () => {
		const record = readNamespaceRecord('/nonexistent/file.art');
		expect(record).toBeNull();
	});

	it('returns null for an invalid file', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'bad.art');
		writeFileSync(file, 'no namespace heading here');

		const record = readNamespaceRecord(file);
		expect(record).toBeNull();
	});
});

describe('readNamespaceRecords', () => {
	it('reads multiple namespace records from a directory', () => {
		const tempDir = makeTempDir(tempDirs);
		writeNamespaceRecord(tempDir, 'NS A', { path: 'a' });
		writeNamespaceRecord(tempDir, 'NS B', { path: 'b' });

		const records = readNamespaceRecords(join(tempDir, 'ops/records'));
		expect(records).toHaveLength(2);
		expect(records.map(r => r.name).sort()).toEqual(['NS A', 'NS B']);
	});

	it('returns empty array for a missing directory', () => {
		const records = readNamespaceRecords('/nonexistent/dir');
		expect(records).toEqual([]);
	});

	it('filters out invalid records', () => {
		const tempDir = makeTempDir(tempDirs);
		writeNamespaceRecord(tempDir, 'Good', { path: '.' });

		const badDir = join(tempDir, 'ops/records/namespaces');
		mkdirSync(badDir, { recursive: true });
		writeFileSync(join(badDir, 'bad.art'), 'no heading');

		const records = readNamespaceRecords(join(tempDir, 'ops/records'));
		expect(records).toHaveLength(1);
		expect(records[0].name).toBe('Good');
	});
});

describe('readPackageRecord', () => {
	it('parses a valid package record', () => {
		const tempDir = makeTempDir(tempDirs);
		writePackageRecord(tempDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		const file = join(tempDir, 'ops/records/packages/art-mantras.art');
		const record = readPackageRecord(file);

		expect(record).not.toBeNull();
		expect(record?.kind).toBe('package');
		expect(record?.name).toBe('Art Mantras');
		expect(record?.canonicalName).toBe('@artisans/art-mantras');
		expect(record?.path).toBe('apps/art-mantras');
	});

	it('returns null for a missing file', () => {
		const record = readPackageRecord('/nonexistent/file.art');
		expect(record).toBeNull();
	});

	it('returns null for an invalid file', () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'bad.art');
		writeFileSync(file, 'no package heading here');

		const record = readPackageRecord(file);
		expect(record).toBeNull();
	});
});

describe('readPackageRecords', () => {
	it('reads multiple package records from a directory', () => {
		const tempDir = makeTempDir(tempDirs);
		writePackageRecord(tempDir, 'Pkg A', { path: 'a' });
		writePackageRecord(tempDir, 'Pkg B', { path: 'b' });

		const records = readPackageRecords(join(tempDir, 'ops/records'));
		expect(records).toHaveLength(2);
		expect(records.map(r => r.name).sort()).toEqual(['Pkg A', 'Pkg B']);
	});

	it('returns empty array for a missing directory', () => {
		const records = readPackageRecords('/nonexistent/dir');
		expect(records).toEqual([]);
	});

	it('filters out invalid records', () => {
		const tempDir = makeTempDir(tempDirs);
		writePackageRecord(tempDir, 'Good', { path: '.' });

		const badDir = join(tempDir, 'ops/records/packages');
		mkdirSync(badDir, { recursive: true });
		writeFileSync(join(badDir, 'bad.art'), 'no heading');

		const records = readPackageRecords(join(tempDir, 'ops/records'));
		expect(records).toHaveLength(1);
		expect(records[0].name).toBe('Good');
	});
});

describe('consolidateProjectGraph', () => {
	it('links projects to namespaces correctly', () => {
		const projects = [
			{ kind: 'project' as const, name: 'Artificial', path: '.', namespaceNames: ['Art Domains'] },
		];
		const namespaces = [
			{ kind: 'namespace' as const, name: 'Art Domains', path: 'artisans', packageNames: [] },
		];

		const graph = consolidateProjectGraph(projects, namespaces, []);

		expect(graph.namespaces.get('Art Domains')).toBeDefined();
		expect(graph.namespaces.get('Art Domains')?.name).toBe('Art Domains');
		expect(graph.warnings).toEqual([]);
	});

	it('links namespaces to packages correctly', () => {
		const projects = [
			{ kind: 'project' as const, name: 'Artificial', path: '.', namespaceNames: ['Art Domains'] },
		];
		const namespaces = [
			{
				kind: 'namespace' as const,
				name: 'Art Domains',
				path: 'artisans',
				packageNames: ['Art Mantras'],
			},
		];
		const packages = [
			{
				kind: 'package' as const,
				name: 'Art Mantras',
				canonicalName: '@artisans/art-mantras',
				path: 'apps/art-mantras',
			},
		];

		const graph = consolidateProjectGraph(projects, namespaces, packages);

		expect(graph.packages.get('Art Mantras')).toBeDefined();
		expect(graph.packages.get('Art Mantras')?.canonicalName).toBe('@artisans/art-mantras');
		expect(graph.warnings).toEqual([]);
	});

	it('generates warnings for missing namespaces', () => {
		const projects = [
			{ kind: 'project' as const, name: 'Artificial', path: '.', namespaceNames: ['Missing'] },
		];

		const graph = consolidateProjectGraph(projects, [], []);

		expect(graph.warnings).toContain('unknown namespace: Missing');
	});

	it('generates warnings for missing packages', () => {
		const projects = [
			{ kind: 'project' as const, name: 'Artificial', path: '.', namespaceNames: ['Art Domains'] },
		];
		const namespaces = [
			{
				kind: 'namespace' as const,
				name: 'Art Domains',
				path: 'artisans',
				packageNames: ['Missing'],
			},
		];

		const graph = consolidateProjectGraph(projects, namespaces, []);

		expect(graph.warnings).toContain('unknown package: Missing');
	});
});

describe('loadProjectGraph', () => {
	it('loads a complete project graph', () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectRecord(tempDir, 'Artificial', {
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceRecord(tempDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageRecord(tempDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		const graph = loadProjectGraph(tempDir);

		expect(graph.projects).toHaveLength(1);
		expect(graph.projects[0].name).toBe('Artificial');
		expect(graph.namespaces.get('Art Domains')).toBeDefined();
		expect(graph.packages.get('Art Mantras')).toBeDefined();
		expect(graph.warnings).toEqual([]);
	});

	it('handles missing records directory', () => {
		const graph = loadProjectGraph('/nonexistent/checkout');

		expect(graph.projects).toEqual([]);
		expect(graph.namespaces.size).toBe(0);
		expect(graph.packages.size).toBe(0);
		expect(graph.warnings).toEqual([]);
	});
});
