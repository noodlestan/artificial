import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockCommandContext } from '../../test/helpers/context/createMockCommandContext';
import { initGitRepoTest } from '../../test/helpers/git/initGitRepoTest';
import { writeCheckoutMockRecord } from '../../test/helpers/records/writeCheckoutMockRecord';
import {
	writeNamespaceMockRecord,
	writePackageMockRecord,
	writeProjectMockRecord,
} from '../../test/helpers/records/writeProjectMockRecord';
import { writeRepoMockRecord } from '../../test/helpers/records/writeRepoMockRecord';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

import { runRepo } from './runRepo';

vi.mock('node:child_process', async importOriginal => {
	const actual = await importOriginal<typeof import('node:child_process')>();
	return { ...actual, execSync: vi.fn() };
});

const tempDirs: string[] = [];

beforeEach(() => {
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('repo command', () => {
	async function setupCheckoutWithPackages(
		tempDir: string,
		ctx: { config: { clone: { path: string } } },
	) {
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepoTest(checkoutDir);

		writeRepoMockRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectMockRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceMockRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageMockRecord(checkoutDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		writeRepoMockRecord(tempDir, 'No Comply', 'git@example.com:no-comply.git');
		writeCheckoutMockRecord(tempDir, 'No Comply', 'No Comply', 'no-comply');

		writeProjectMockRecord(tempDir, 'No Comply', {
			remote: 'git@example.com:no-comply.git',
			path: '.',
			namespaces: ['Standard UI'],
		});
		writeNamespaceMockRecord(tempDir, 'Standard UI', {
			path: 'standard-ui',
			packages: ['Standard UI Demo'],
		});
		writePackageMockRecord(tempDir, 'Standard UI Demo', {
			canonicalName: '@standard-ui/demo-app',
			path: 'apps/demo',
		});

		const pkgDir = join(checkoutDir, 'artisans', 'apps', 'art-mantras');
		mkdirSync(pkgDir, { recursive: true });
		writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({ version: '1.0.0' }));

		vi.mocked(execSync).mockReturnValue('1.2.3\n');
		vi.mocked(execSync).mockClear();

		return checkoutDir;
	}

	it("lists a single checkout's packages", async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		await setupCheckoutWithPackages(tempDir, ctx);

		await runRepo(ctx, { locations: ['artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('@artisans/art-mantras');
		expect(output).toContain('1.0.0');
		expect(output).toContain('1.2.3');
		expect(output).not.toContain('No Comply');
		expect(output).not.toContain('Standard UI');
		expect(output).not.toContain('Standard UI Demo');
		expect(output).not.toContain('@standard-ui/demo-app');
	});

	it('defaults to all checkouts when none specified', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const dir1 = join(tempDir, ctx.config.clone.path, 'artificial');
		const dir2 = join(tempDir, ctx.config.clone.path, 'conventions-fixes');
		await initGitRepoTest(dir1);
		await initGitRepoTest(dir2);

		writeRepoMockRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeRepoMockRecord(tempDir, 'Conventions', 'git@example.com:conventions.git');
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');
		writeCheckoutMockRecord(tempDir, 'Conventions', 'Conventions @ fixes', 'conventions-fixes');

		const recDir1 = join(dir1, '_records');
		const recDir2 = join(dir2, '_records');
		mkdirSync(recDir1, { recursive: true });
		mkdirSync(recDir2, { recursive: true });
		writeFileSync(
			join(recDir1, 'artificial.art'),
			'# Module\n\n## Project: Artificial v1\n\n**Remote:** `git@example.com:artificial.git`\n\n**Path:** `.`\n\n**Namespaces:**\n- Namespace: Art Domains\n',
		);
		writeFileSync(
			join(recDir1, 'art-domains.art'),
			'# Module\n\n## Namespace: Art Domains\n\n**Path:** `domains`\n\n**Packages:**\n- Package: Art Mantras\n',
		);
		writeFileSync(
			join(recDir1, 'art-mantras.art'),
			'# Module\n\n## Package: Art Mantras\n\n**Canonical Name:** `@domains/art-mantras`\n\n**Path:** `apps/art-mantras`\n',
		);
		writeFileSync(
			join(recDir2, 'conventions.art'),
			'# Module\n\n## Project: Conventions v2\n\n**Remote:** `git@example.com:conventions.git`\n\n**Path:** `.`\n\n**Namespaces:**\n- Namespace: Noodlestan\n',
		);
		writeFileSync(
			join(recDir2, 'noodlestan.art'),
			'# Module\n\n## Namespace: Noodlestan\n\n**Path:** `noodlestan`\n\n**Packages:**\n- Package: Solid Conventions\n',
		);
		writeFileSync(
			join(recDir2, 'art-projections.art'),
			'# Module\n\n## Package: Solid Conventions\n\n**Canonical Name:** `@noodlestan/solid-conventions`\n\n**Path:** `libs/solid-conventions`\n',
		);

		const pkgDir1 = join(dir1, 'domains', 'apps', 'art-mantras');
		mkdirSync(pkgDir1, { recursive: true });
		writeFileSync(join(pkgDir1, 'package.json'), JSON.stringify({ version: '1.0.0' }));

		const pkgDir2 = join(dir2, 'noodlestan', 'libs', 'solid-conventions');
		mkdirSync(pkgDir2, { recursive: true });
		writeFileSync(join(pkgDir2, 'package.json'), JSON.stringify({ version: '2.0.0' }));

		vi.mocked(execSync).mockReturnValue('1.2.3\n');
		vi.mocked(execSync).mockClear();

		await runRepo(ctx, { locations: [] });

		const lines = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);

		const output = lines.join('\n');
		expect(output).toContain('1.0.0');
		expect(output).toContain('2.0.0');
		expect(output).toContain('@domains/art-mantras');
		expect(output).toContain('@noodlestan/solid-conventions');

		const repoIdx1 = lines.findIndex(l => l.startsWith('  name: Artificial'));
		const pkgIdx1 = lines.findIndex(l => l.startsWith('Packages for Artificial:'));
		const repoIdx2 = lines.findIndex(l => l.startsWith('  name: Conventions'));
		const pkgIdx2 = lines.findIndex(l => l.startsWith('Packages for Conventions @ fixes:'));

		expect(pkgIdx1).toBeGreaterThanOrEqual(0);
		expect(pkgIdx2).toBeGreaterThanOrEqual(0);

		expect(repoIdx1).toBeLessThan(pkgIdx1);
		expect(pkgIdx1).toBeLessThan(repoIdx2);
		expect(repoIdx2).toBeLessThan(pkgIdx2);

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).not.toContain('unknown checkout');
	});

	it('identifies checkout without project records', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'purrception');
		await initGitRepoTest(checkoutDir);

		writeRepoMockRecord(tempDir, 'Purrception', 'git@example.com:purrception.git');
		writeCheckoutMockRecord(tempDir, 'Purrception', 'Purrception', 'purrception');

		await runRepo(ctx, { locations: ['purrception'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('issues: no project records');
	});

	it('groups each repository report with its package report', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const dir1 = join(tempDir, ctx.config.clone.path, 'artificial');
		const dir2 = join(tempDir, ctx.config.clone.path, 'purrception');
		await initGitRepoTest(dir1);
		await initGitRepoTest(dir2);

		writeRepoMockRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeRepoMockRecord(tempDir, 'Purrception', 'git@example.com:purrception.git');
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');
		writeCheckoutMockRecord(tempDir, 'Purrception', 'Purrception', 'purrception');

		writeProjectMockRecord(dir1, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceMockRecord(dir1, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageMockRecord(dir1, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		writeProjectMockRecord(dir2, 'Purrception', {
			remote: 'git@example.com:purrception.git',
			path: '.',
			namespaces: ['Purrception Domains'],
		});
		writeNamespaceMockRecord(dir2, 'Purrception Domains', {
			path: 'core',
			packages: ['Purrception Core'],
		});
		writePackageMockRecord(dir2, 'Purrception Core', {
			canonicalName: '@purrception/core',
			path: 'packages/core',
		});

		await runRepo(ctx, { locations: [] });

		const lines = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
		const repoIdx1 = lines.findIndex(l => l === '  name: Artificial');
		const repoIdx2 = lines.findIndex(l => l === '  name: Purrception');
		const pkgIdx1 = lines.findIndex(l => l.startsWith('Packages for Artificial'));
		const pkgIdx2 = lines.findIndex(l => l.startsWith('Packages for Purrception'));

		expect(repoIdx1).toBeGreaterThanOrEqual(0);
		expect(repoIdx2).toBeGreaterThanOrEqual(0);
		expect(pkgIdx1).toBeGreaterThanOrEqual(0);
		expect(pkgIdx2).toBeGreaterThanOrEqual(0);

		expect(repoIdx1).toBeLessThan(pkgIdx1);
		expect(pkgIdx1).toBeLessThan(repoIdx2);
		expect(repoIdx2).toBeLessThan(pkgIdx2);
	});

	it('unknown checkout warns and skips', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);

		await runRepo(ctx, { locations: ['unknown'] });

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).toContain('unknown checkout: unknown');
	});

	it('identifies project referencing a missing namespace', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepoTest(checkoutDir);

		writeRepoMockRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectMockRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Missing'],
		});

		await runRepo(ctx, { locations: ['artificial'] });

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).toContain('unknown namespace: Missing');
	});

	it('identifies namespace referencing a missing package', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepoTest(checkoutDir);

		writeRepoMockRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectMockRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceMockRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Missing'],
		});

		await runRepo(ctx, { locations: ['artificial'] });

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).toContain('unknown package: Missing');
	});

	it('identifies packages with no package.json', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepoTest(checkoutDir);

		writeRepoMockRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutMockRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectMockRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceMockRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageMockRecord(checkoutDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		vi.mocked(execSync).mockReturnValue('1.2.3\n');
		vi.mocked(execSync).mockClear();

		await runRepo(ctx, { locations: ['artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('no package.json');
		expect(output).not.toContain('npm info failed');

		expect(execSync).not.toHaveBeenCalled();
	});

	it('identifies packages where npm info fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createMockCommandContext(tempDir);
		await setupCheckoutWithPackages(tempDir, ctx);

		vi.mocked(execSync).mockImplementation(() => {
			throw new Error('npm info failed');
		});

		await runRepo(ctx, { locations: ['artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('unknown');
		expect(output).not.toContain('npm info failed');
	});
});
