import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Checkout } from '../store/createCheckout';

import { presentWorkspaceReport } from './presentWorkspaceReport';

afterEach(() => {
	vi.restoreAllMocks();
});

function makeWorkspaceCheckout(path: string, overrides?: Partial<Checkout>): Checkout {
	return {
		repo: undefined,
		record: { name: 'Workspace', location: '.', branch: 'main', repository: undefined },
		path,
		scan: {
			exists: true,
			branch: 'main',
			remoteBranch: null,
			detached: false,
			conflicts: false,
			dirty: false,
			hasRemote: true,
			unpushed: 0,
			isBehind: false,
			issues: [],
		},
		...overrides,
	};
}

describe('presentWorkspaceReport', () => {
	it('prints Workspace: header and table', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

		presentWorkspaceReport(makeWorkspaceCheckout('/tmp'));

		expect(spy).toHaveBeenCalledWith('Workspace:');
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('repo'));
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('main'));
	});

	it('prints issues in states column', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

		presentWorkspaceReport(
			makeWorkspaceCheckout('/tmp', {
				scan: {
					exists: true,
					branch: 'main',
					remoteBranch: null,
					detached: false,
					conflicts: false,
					dirty: true,
					hasRemote: true,
					unpushed: 1,
					isBehind: false,
					issues: ['uncommitted files', '1 commit ahead'],
				},
			}),
		);

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('uncommitted files; 1 commit ahead'));
	});

	it('renders the behind issue in the states column', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

		presentWorkspaceReport(
			makeWorkspaceCheckout('/tmp', {
				scan: {
					exists: true,
					branch: 'main',
					remoteBranch: null,
					detached: false,
					conflicts: false,
					dirty: false,
					hasRemote: true,
					unpushed: 0,
					isBehind: true,
					issues: ['1 commit behind'],
				},
			}),
		);

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 commit behind'));
	});

	it('returns early when workspace is undefined', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

		presentWorkspaceReport(undefined);

		expect(spy).not.toHaveBeenCalledWith('Workspace:');
	});
});
