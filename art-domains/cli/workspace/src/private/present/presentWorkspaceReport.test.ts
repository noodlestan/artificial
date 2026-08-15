import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import type { Checkout } from '../store/createCheckout';

import { presentWorkspaceReport } from './presentWorkspaceReport';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('presentWorkspaceReport', () => {
	it('prints Workspace: header and table', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const workspace: Checkout = {
			repo: undefined,
			record: { name: 'Workspace', location: '.', branch: 'main', repository: undefined },
			path: tempDir,
			exists: true,
			remoteBranch: null,
			detached: false,
			conflicts: false,
			dirty: false,
			hasRemote: true,
			unpushed: 0,
			isBehind: false,
			issues: [],
			extraneous: false,
		};
		ctx.workspace = workspace;

		presentWorkspaceReport(ctx);

		expect(spy).toHaveBeenCalledWith('Workspace:');
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('repo'));
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('main'));
	});

	it('prints issues in states column', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const workspace: Checkout = {
			repo: undefined,
			record: { name: 'Workspace', location: '.', branch: 'main', repository: undefined },
			path: tempDir,
			exists: true,
			remoteBranch: null,
			detached: false,
			conflicts: false,
			dirty: true,
			hasRemote: true,
			unpushed: 1,
			isBehind: false,
			issues: ['uncommitted files', '1 commit ahead'],
			extraneous: false,
		};
		ctx.workspace = workspace;

		presentWorkspaceReport(ctx);

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('uncommitted files; 1 commit ahead'));
	});

	it('renders the behind issue in the states column', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		const workspace: Checkout = {
			repo: undefined,
			record: { name: 'Workspace', location: '.', branch: 'main', repository: undefined },
			path: tempDir,
			exists: true,
			remoteBranch: 'origin/main',
			detached: false,
			conflicts: false,
			dirty: false,
			hasRemote: true,
			unpushed: 0,
			isBehind: true,
			issues: ['1 commit behind'],
			extraneous: false,
		};
		ctx.workspace = workspace;

		presentWorkspaceReport(ctx);

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 commit behind'));
	});

	it('returns early when workspace is undefined', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);

		presentWorkspaceReport(ctx);

		expect(spy).not.toHaveBeenCalledWith('Workspace:');
	});
});
