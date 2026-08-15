import path, { join } from 'node:path';

import { WorkspaceConfig } from '../../config';
import { CheckoutRecord, RepositoryRecord } from '../records/types';

import { safePath } from './safePath';

export interface Checkout {
	repo?: RepositoryRecord;
	record: CheckoutRecord;
	path: string;
	exists: boolean;
	remoteBranch: string | null;
	detached: boolean;
	conflicts: boolean;
	dirty: boolean;
	hasRemote: boolean;
	unpushed: number;
	isBehind: boolean;
	issues: string[];
	extraneous: boolean;
}

export function createCheckout(
	config: WorkspaceConfig,
	target: string,
	repo?: RepositoryRecord,
	branch?: string,
	name?: string,
): Checkout {
	const basePath = join(config.root.path, config.clone.path);
	const l = safePath(target);
	const r = repo;
	const b = branch ?? 'main';
	const n = name || (r?.name ? r?.name + ' @' + target : target);

	return {
		repo: r,
		record: { name: n, location: l, branch: b, repository: r?.name },
		path: path.join(basePath, l),
		exists: false,
		remoteBranch: null,
		detached: false,
		conflicts: false,
		dirty: false,
		hasRemote: false,
		unpushed: 0,
		isBehind: false,
		issues: [],
		extraneous: false,
	};
}
