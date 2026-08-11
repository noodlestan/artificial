import { loadCheckouts } from '../config/load-checkouts';
import type { RepositoryRecord, WorkspaceConfig } from '../config/types';

import type { Checkout } from './checkout';
import { createCheckout } from './checkout';

export interface CheckoutStore {
	addCheckout(repo: RepositoryRecord, location: string): Checkout;
	loadExistingCheckouts(): void;
	findCheckout(name: string): Checkout | undefined;
	getCheckout(name: string): Checkout | undefined;
	setCheckout(checkout: Checkout): void;
	getAllCheckouts(): Checkout[];
	markExtraneous(location: string): Checkout;
	getExtraneous(): Checkout[];
	syncRecords(): void;
}

export function createCheckoutStore(config: WorkspaceConfig, root: string): CheckoutStore {
	const checkouts = new Map<string, Checkout>();

	return {
		addCheckout(repo: RepositoryRecord, location: string): Checkout {
			const checkout = createCheckout(repo, location, 'main');
			checkouts.set(checkout.record.name.toLowerCase(), checkout);
			return checkout;
		},

		loadExistingCheckouts(): void {
			const records = loadCheckouts(config, root);
			for (const record of records) {
				const key = record.repo.name.toLowerCase();
				if (!checkouts.has(key)) {
					const checkout = createCheckout(record.repo, record.location, record.branch);
					checkouts.set(key, checkout);
				}
			}
		},

		findCheckout(name: string): Checkout | undefined {
			const key = name.toLowerCase();
			// Strip package scope if present
			const bare = key.includes('/') ? key.split('/')[1] : key;
			return checkouts.get(bare);
		},

		getCheckout(name: string): Checkout | undefined {
			return checkouts.get(name.toLowerCase());
		},

		setCheckout(checkout: Checkout): void {
			const key = checkout.record.name.toLowerCase();
			checkouts.set(key, checkout);
		},

		getAllCheckouts(): Checkout[] {
			return Array.from(checkouts.values());
		},

		markExtraneous(location: string): Checkout {
			const name = location.split('/').pop() ?? location;
			const checkout: Checkout = {
				repo: { name, remote: '' },
				record: { name, location, branch: '-' },
				exists: false,
				branch: '-',
				remoteBranch: null,
				detached: false,
				conflicts: false,
				dirty: false,
				hasRemote: false,
				unpushed: 0,
				issues: [],
				extraneous: true,
			};
			checkouts.set(name.toLowerCase(), checkout);
			return checkout;
		},

		getExtraneous(): Checkout[] {
			return Array.from(checkouts.values()).filter(c => c.extraneous);
		},

		syncRecords(): void {
			// Commit 2 — persist store state to disk records
		},
	};
}
