import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { loadCheckouts } from '../config/load-checkouts';
import type { RepositoryRecord, WorkspaceConfig } from '../config/types';
import { readCheckoutRecord } from '../private/records/checkout-record';

import type { Checkout } from './checkout';
import { createCheckout } from './checkout';

export interface CheckoutStore {
	addCheckout(repo: RepositoryRecord, location: string, name?: string): Checkout;
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
		addCheckout(repo: RepositoryRecord, location: string, name?: string): Checkout {
			const checkout = createCheckout(repo, location, 'main', name);
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
			// Also store under checkout names derived from record files
			const dir = join(root, config.records.checkouts.path);
			if (existsSync(dir)) {
				const files = readdirSync(dir).filter(f => f.endsWith('.art'));
				for (const file of files) {
					const rec = readCheckoutRecord(join(dir, file));
					if (rec.name) {
						const nameKey = rec.name.toLowerCase();
						if (!checkouts.has(nameKey)) {
							// Find by location since we don't have the repo name key
							const existing = Array.from(checkouts.values()).find(
								c => c.record.location === rec.location,
							);
							if (existing) {
								checkouts.set(nameKey, existing);
							}
						}
					}
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
