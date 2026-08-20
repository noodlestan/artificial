import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeMockConfig } from '../../../test/helpers/context/makeMockConfig';
import {
	writeNamespaceMockRecord,
	writePackageMockRecord,
	writeProjectMockRecord,
} from '../../../test/helpers/records/writeProjectMockRecord';
import { makeTempDir } from '../../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../../test/helpers/tempDirs/removeTempDirs';
import { createRecordFile } from '../../records/private/createRecordFile';
import { loadNamespaceRecords } from '../namespace/loadNamespaceRecords';
import { readNamespaceRecord } from '../namespace/readNamespaceRecord';
import { loadPackageRecords } from '../package/loadPackageRecords';
import { readPackageRecord } from '../package/readPackageRecord';
import { loadProjectRecords } from '../project/loadProjectRecords';
import { readProjectRecord } from '../project/readProjectRecord';

import { consolidateProjectGraph } from './consolidateProjectGraph';
import { loadProjectGraph } from './loadProjectGraph';

const tempDirs: string[] = [];

const makeRecordFile = (filename: string) => createRecordFile(dirname(filename), filename);

beforeEach(() => {
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('readProjectRecord', () => {
	it('parses a valid project record', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectMockRecord(tempDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: 'artisans',
			namespaces: ['Art Domains', 'Art Tools'],
		});

		const file = join(tempDir, '_records/artificial.art');
		const record = await readProjectRecord(makeRecordFile(file));

		expect(record).not.toBeNull();
		expect(record?.kind).toBe('project');
		expect(record?.name).toBe('Artificial');
		expect(record?.path).toBe('artisans');
		expect(record?.namespaceNames).toEqual(['Art Domains', 'Art Tools']);
	});

	it('returns null for a missing file', async () => {
		const record = await readProjectRecord(makeRecordFile('/nonexistent/file.art'));
		expect(record).toBeNull();
	});

	it('returns null for an invalid file', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'bad.art');
		writeFileSync(file, 'no project heading here');

		const record = await readProjectRecord(makeRecordFile(file));
		expect(record).toBeNull();
	});
});

describe('loadProjectRecords', () => {
	it('discovers project records from _records/ directory', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectMockRecord(tempDir, 'Project A', { path: '.' });
		writeProjectMockRecord(tempDir, 'Project B', { path: 'b' });
		const config = makeMockConfig(tempDir);

		const records = await loadProjectRecords(config, tempDir);
		expect(records).toHaveLength(2);
		expect(records.map(r => r.name).sort()).toEqual(['Project A', 'Project B']);
	});

	it('returns empty array for a missing checkout path', async () => {
		const config = makeMockConfig('/nonexistent/checkout');
		const records = await loadProjectRecords(config, '/nonexistent/checkout');
		expect(records).toEqual([]);
	});

	it('filters out invalid records', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectMockRecord(tempDir, 'Good', { path: '.' });

		const badFile = join(tempDir, '_records/bad.art');
		writeFileSync(badFile, 'no heading');

		const config = makeMockConfig(tempDir);
		const records = await loadProjectRecords(config, tempDir);
		expect(records).toHaveLength(1);
		expect(records[0].name).toBe('Good');
	});
});

describe('readNamespaceRecord', () => {
	it('parses a valid namespace record', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeNamespaceMockRecord(tempDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras', 'Art Tools'],
		});

		const file = join(tempDir, '_records/art-domains.art');
		const record = await readNamespaceRecord(makeRecordFile(file));

		expect(record).not.toBeNull();
		expect(record?.kind).toBe('namespace');
		expect(record?.name).toBe('Art Domains');
		expect(record?.path).toBe('artisans');
		expect(record?.packageNames).toEqual(['Art Mantras', 'Art Tools']);
	});

	it('returns null for a missing file', async () => {
		const record = await readNamespaceRecord(makeRecordFile('/nonexistent/file.art'));
		expect(record).toBeNull();
	});

	it('returns null for an invalid file', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'bad.art');
		writeFileSync(file, 'no namespace heading here');

		const record = await readNamespaceRecord(makeRecordFile(file));
		expect(record).toBeNull();
	});
});

describe('loadNamespaceRecords', () => {
	it('discovers namespace records from _records/ directory', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeNamespaceMockRecord(tempDir, 'NS A', { path: 'a' });
		writeNamespaceMockRecord(tempDir, 'NS B', { path: 'b' });
		const config = makeMockConfig(tempDir);

		const records = await loadNamespaceRecords(config, tempDir);
		expect(records).toHaveLength(2);
		expect(records.map(r => r.name).sort()).toEqual(['NS A', 'NS B']);
	});

	it('returns empty array for a missing checkout path', async () => {
		const config = makeMockConfig('/nonexistent/checkout');
		const records = await loadNamespaceRecords(config, '/nonexistent/checkout');
		expect(records).toEqual([]);
	});

	it('filters out invalid records', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeNamespaceMockRecord(tempDir, 'Good', { path: '.' });

		const badFile = join(tempDir, '_records/bad.art');
		writeFileSync(badFile, 'no heading');

		const config = makeMockConfig(tempDir);
		const records = await loadNamespaceRecords(config, tempDir);
		expect(records).toHaveLength(1);
		expect(records[0].name).toBe('Good');
	});
});

describe('readPackageRecord', () => {
	it('parses a valid package record', async () => {
		const tempDir = makeTempDir(tempDirs);
		writePackageMockRecord(tempDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		const file = join(tempDir, '_records/art-mantras.art');
		const record = await readPackageRecord(makeRecordFile(file));

		expect(record).not.toBeNull();
		expect(record?.kind).toBe('package');
		expect(record?.name).toBe('Art Mantras');
		expect(record?.canonicalName).toBe('@artisans/art-mantras');
		expect(record?.path).toBe('apps/art-mantras');
	});

	it('returns null for a missing file', async () => {
		const record = await readPackageRecord(makeRecordFile('/nonexistent/file.art'));
		expect(record).toBeNull();
	});

	it('returns null for an invalid file', async () => {
		const tempDir = makeTempDir(tempDirs);
		const file = join(tempDir, 'bad.art');
		writeFileSync(file, 'no package heading here');

		const record = await readPackageRecord(makeRecordFile(file));
		expect(record).toBeNull();
	});
});

describe('loadPackageRecords', () => {
	it('discovers package records from _records/ directory', async () => {
		const tempDir = makeTempDir(tempDirs);
		writePackageMockRecord(tempDir, 'Pkg A', { path: 'a' });
		writePackageMockRecord(tempDir, 'Pkg B', { path: 'b' });
		const config = makeMockConfig(tempDir);

		const records = await loadPackageRecords(config, tempDir);
		expect(records).toHaveLength(2);
		expect(records.map(r => r.name).sort()).toEqual(['Pkg A', 'Pkg B']);
	});

	it('returns empty array for a missing checkout path', async () => {
		const config = makeMockConfig('/nonexistent/checkout');
		const records = await loadPackageRecords(config, '/nonexistent/checkout');
		expect(records).toEqual([]);
	});

	it('filters out invalid records', async () => {
		const tempDir = makeTempDir(tempDirs);
		writePackageMockRecord(tempDir, 'Good', { path: '.' });

		const badFile = join(tempDir, '_records/bad.art');
		writeFileSync(badFile, 'no heading');

		const config = makeMockConfig(tempDir);
		const records = await loadPackageRecords(config, tempDir);
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
	it('loads a complete project graph from _records/', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectMockRecord(tempDir, 'Artificial', {
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceMockRecord(tempDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageMockRecord(tempDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});
		const config = makeMockConfig(tempDir);

		const graph = await loadProjectGraph(config, tempDir);

		expect(graph.projects).toHaveLength(1);
		expect(graph.projects[0].name).toBe('Artificial');
		expect(graph.namespaces.get('Art Domains')).toBeDefined();
		expect(graph.packages.get('Art Mantras')).toBeDefined();
		expect(graph.warnings).toEqual([]);
	});

	it('loads a complete project graph from legacy ops/records/ layout', async () => {
		const tempDir = makeTempDir(tempDirs);
		const projectsDir = join(tempDir, 'ops/records/projects');
		const namespacesDir = join(tempDir, 'ops/records/namespaces');
		const packagesDir = join(tempDir, 'ops/records/packages');
		mkdirSync(projectsDir, { recursive: true });
		mkdirSync(namespacesDir, { recursive: true });
		mkdirSync(packagesDir, { recursive: true });

		writeFileSync(
			join(projectsDir, 'artificial.art'),
			'# Module\n\n## Project: Artificial\n\n**Path:** `.`\n\n**Namespaces:**\n- Namespace: Art Domains\n',
		);
		writeFileSync(
			join(namespacesDir, 'art-domains.art'),
			'# Module\n\n## Namespace: Art Domains\n\n**Path:** `artisans`\n\n**Packages:**\n- Package: Art Mantras\n',
		);
		writeFileSync(
			join(packagesDir, 'art-mantras.art'),
			'# Module\n\n## Package: Art Mantras\n\n**Canonical Name:** `@artisans/art-mantras`\n\n**Path:** `apps/art-mantras`\n',
		);
		const config = makeMockConfig(tempDir);

		const graph = await loadProjectGraph(config, tempDir);

		expect(graph.projects).toHaveLength(1);
		expect(graph.projects[0].name).toBe('Artificial');
		expect(graph.namespaces.get('Art Domains')).toBeDefined();
		expect(graph.packages.get('Art Mantras')).toBeDefined();
	});

	it('ignores decoy .art files that are not project/namespace/package records', async () => {
		const tempDir = makeTempDir(tempDirs);
		writeProjectMockRecord(tempDir, 'Real', { path: '.' });

		writeFileSync(
			join(tempDir, '_records/not-a-record.art'),
			'# Module\n\n## Repository: Ignored\n',
		);
		writeFileSync(
			join(tempDir, '_records/checkout-decoy.art'),
			'# Module\n\n## Checkout: Ignored\n',
		);
		writeFileSync(join(tempDir, '_records/bad-project.art'), 'no heading');

		const config = makeMockConfig(tempDir);
		const graph = await loadProjectGraph(config, tempDir);

		expect(graph.projects).toHaveLength(1);
		expect(graph.projects[0].name).toBe('Real');
		expect(graph.warnings).toEqual([]);
	});

	it('handles missing records directory', async () => {
		const config = makeMockConfig('/nonexistent/checkout');
		const graph = await loadProjectGraph(config, '/nonexistent/checkout');

		expect(graph.projects).toEqual([]);
		expect(graph.namespaces.size).toBe(0);
		expect(graph.packages.size).toBe(0);
		expect(graph.warnings).toEqual([]);
	});

	it('picks up records from nested _records/ directories', async () => {
		const tempDir = makeTempDir(tempDirs);
		const nestedDir = join(tempDir, 'libs/parser');
		mkdirSync(join(nestedDir, '_records'), { recursive: true });

		writeFileSync(
			join(nestedDir, '_records/package.art'),
			'# Module\n\n## Package: Parser\n\n**Canonical Name:** `@art/parser`\n\n**Path:** `.`\n',
		);
		const config = makeMockConfig(tempDir);

		const records = await loadPackageRecords(config, tempDir);
		expect(records).toHaveLength(1);
		expect(records[0].name).toBe('Parser');
	});
});
