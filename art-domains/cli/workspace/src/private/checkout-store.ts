import { join } from 'node:path';

import type { RepositoryRecord, WorkspaceConfig } from '../config/types';
import { loadCheckouts } from './records/checkout-record';

export interface CheckoutStatus {
	name: string;
	location: string;
	branch: string;
	exists: boolean;
	detached: boolean;
	conflicts: boolean;
	dirty: boolean;
	hasRemote: boolean;
	unpushed: number;
	issues: string[];
	pushed: 'no' | 'now' | 'yes';
	extraneous: boolean;
	repo?: RepositoryRecord;
}

export interface CheckoutStore {
	addCheckout(repo: RepositoryRecord, location: string): void;
	loadExistingCheckouts(): void;
	getCheckout(name: string): CheckoutStatus | undefined;
	getAllCheckouts(): CheckoutStatus[];
	markExtraneous(location: string): void;
}

export function createCheckoutStore(
	config: WorkspaceConfig,
	root: string,
): CheckoutStore {
	const checkouts = new Map<string, CheckoutStatus>();

	return {
		addCheckout(repo: RepositoryRecord, location: string): void {
			checkouts.set(repo.name, {
				name: repo.name,
				location,
				branch: 'main',
				exists: false,
				detached: false,
				conflicts: false,
				dirty: false,
				hasRemote: false,
				unpushed: 0,
				issues: [],
				pushed: 'no',
				extraneous: false,
				repo,
			});
		},

		loadExistingCheckouts(): void {
			const records = loadCheckouts(config, root);
			for (const record of records) {
				checkouts.set(record.repo.name, {
					name: record.repo.name,
					location: record.location,
					branch: record.branch,
					exists: false,
					detached: false,
					conflicts: false,
					dirty: false,
					hasRemote: false,
					unpushed: 0,
					issues: [],
					pushed: 'no',
					extraneous: false,
					repo: record.repo,
				});
			}
		},

		getCheckout(name: string): CheckoutStatus | undefined {
			return checkouts.get(name);
		},

		getAllCheckouts(): CheckoutStatus[] {
			return Array.from(checkouts.values());
		},

		markExtraneous(location: string): void {
			const name = location.split('/').pop() ?? location;
			checkouts.set(name, {
				name,
				location,
				branch: '-',
				exists: false,
				detached: false,
				conflicts: false,
				dirty: false,
				hasRemote: false,
				unpushed: 0,
				issues: [],
				pushed: 'no',
				extraneous: true,
			});
		},
	};
}
