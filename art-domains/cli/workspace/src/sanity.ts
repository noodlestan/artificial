import { join } from 'node:path';

import simpleGit from 'simple-git';

import { loadWorkspaceConfig } from './config';
import { createCheckoutStore } from './private/checkout-store';
import { presentCheckoutStatus } from './private/present';
import { scanAllCheckouts, scanExtraneousCheckouts } from './private/scan';

interface SanityOptions {
	root: string;
	auto: boolean;
}

export async function runSanity({ root, auto }: SanityOptions): Promise<void> {
	const config = await loadWorkspaceConfig(root);
	const store = createCheckoutStore(config, root);

	store.loadExistingCheckouts();
	await scanAllCheckouts(store, root);
	await scanExtraneousCheckouts(store, config, root);

	if (auto) {
		for (const checkout of store.getAllCheckouts()) {
			if (!checkout.exists) continue;
			if (checkout.extraneous) continue;
			if (
				checkout.issues.some(
					i =>
						i.includes('uncommitted') ||
						i.includes('merge conflicts') ||
						i.includes('detached HEAD'),
				)
			)
				continue;
			if (checkout.pushed !== 'no') continue;
			if (checkout.issues.some(i => i.includes('no remote'))) continue;

			const dir = join(root, checkout.location);
			const git = simpleGit(dir);
			try {
				await git.push('origin', checkout.branch);
				checkout.pushed = 'now';
				checkout.issues = checkout.issues.filter(
					i => !/\d+ commit/.test(i) && i !== 'not pushed',
				);
			} catch {
				// push failed, leave as 'no'
			}
		}
	}

	presentCheckoutStatus(store);
}
