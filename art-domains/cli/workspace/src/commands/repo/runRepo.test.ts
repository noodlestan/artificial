import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { initGitRepo } from '../../test/initGitRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { writeCheckoutRecord } from '../../test/writeCheckoutRecord';
import {
	writeNamespaceRecord,
	writePackageRecord,
	writeProjectRecord,
} from '../../test/writeProjectRecord';
import { writeRepoRecord } from '../../test/writeRepoRecord';

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
	it("lists a single checkout's packages", async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepo(checkoutDir);

		writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageRecord(checkoutDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		const pkgDir = join(checkoutDir, 'artisans', 'apps', 'art-mantras');
		mkdirSync(pkgDir, { recursive: true });
		writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({ version: '1.2.3' }));

		vi.mocked(execSync).mockReturnValue('1.0.0\n');

		await runRepo(ctx, { checkoutNames: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('@artisans/art-mantras');
		expect(output).toContain('1.2.3');
		expect(output).toContain('1.0.0');
	});

	it('defaults to all checkouts when none specified', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const dir1 = join(tempDir, ctx.config.clone.path, 'artificial');
		const dir2 = join(tempDir, ctx.config.clone.path, 'purrception');
		await initGitRepo(dir1);
		await initGitRepo(dir2);

		writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeRepoRecord(tempDir, 'Purrception', 'git@example.com:purrception.git');
		writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');
		writeCheckoutRecord(tempDir, 'Purrception', 'Purrception', 'purrception');

		for (const dir of [dir1, dir2]) {
			writeProjectRecord(dir, 'Project', { path: '.', namespaces: [] });
		}

		await runRepo(ctx, { checkoutNames: [] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('Artificial');
		expect(output).toContain('Purrception');
	});

	it('checkout has no project records', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'purrception');
		await initGitRepo(checkoutDir);

		writeRepoRecord(tempDir, 'Purrception', 'git@example.com:purrception.git');
		writeCheckoutRecord(tempDir, 'Purrception', 'Purrception', 'purrception');

		await runRepo(ctx, { checkoutNames: ['Purrception'] });

		const checkout = ctx.store.getCheckoutByName('Purrception');
		expect(checkout?.issues).toContain('no project records');
	});

	it('unknown checkout warns and skips', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		await runRepo(ctx, { checkoutNames: ['Unknown'] });

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).toContain('unknown checkout: Unknown');
	});

	it('project references a missing namespace', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepo(checkoutDir);

		writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Missing'],
		});

		await runRepo(ctx, { checkoutNames: ['Artificial'] });

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).toContain('unknown namespace: Missing');
	});

	it('namespace references a missing package', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepo(checkoutDir);

		writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Missing'],
		});

		await runRepo(ctx, { checkoutNames: ['Artificial'] });

		const warnCalls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
			.map(c => c[0])
			.join('\n');
		expect(warnCalls).toContain('unknown package: Missing');
	});

	it('package path has no package.json', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepo(checkoutDir);

		writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageRecord(checkoutDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		vi.mocked(execSync).mockReturnValue('1.0.0\n');
		vi.mocked(execSync).mockClear();

		await runRepo(ctx, { checkoutNames: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('no package.json');
		expect(output).not.toContain('npm info failed');

		expect(execSync).not.toHaveBeenCalled();
	});

	it('npm info fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
		await initGitRepo(checkoutDir);

		writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
		writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

		writeProjectRecord(checkoutDir, 'Artificial', {
			remote: 'git@example.com:artificial.git',
			path: '.',
			namespaces: ['Art Domains'],
		});
		writeNamespaceRecord(checkoutDir, 'Art Domains', {
			path: 'artisans',
			packages: ['Art Mantras'],
		});
		writePackageRecord(checkoutDir, 'Art Mantras', {
			canonicalName: '@artisans/art-mantras',
			path: 'apps/art-mantras',
		});

		const pkgDir = join(checkoutDir, 'artisans', 'apps', 'art-mantras');
		mkdirSync(pkgDir, { recursive: true });
		writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({ version: '1.2.3' }));

		vi.mocked(execSync).mockImplementation(() => {
			throw new Error('npm info failed');
		});

		await runRepo(ctx, { checkoutNames: ['Artificial'] });

		const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
		expect(output).toContain('unknown');
		expect(output).not.toContain('npm info failed');
	});
});
