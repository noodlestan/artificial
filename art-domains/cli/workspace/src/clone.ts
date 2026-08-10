import { join } from 'node:path';

import simpleGit from 'simple-git';

import { loadWorkspaceConfig } from './config';
import { getCurrentBranch } from './private/branching';
import { createCheckoutStore } from './private/checkout-store';
import {
	loadCheckouts,
	saveCheckoutRecord,
} from './private/records/checkout-record';
import { loadRepositories } from './private/records/repository-record';
import { presentCheckoutStatus } from './private/present';
import {
	scanAllCheckouts,
	scanCheckout,
	scanExtraneousCheckouts,
} from './private/scan';

interface CloneOptions {
	root: string;
	all?: boolean;
	name?: string;
	target?: string;
}

async function cloneRepo(
	repoName: string,
	location: string,
	remote: string,
	config: Awaited<ReturnType<typeof loadWorkspaceConfig>>,
	root: string,
): Promise<boolean> {
	const git = simpleGit(root);
	try {
		await git.clone(remote, location);
		const recordFile = join(
			root,
			config.records.checkouts.path,
			`${repoName.toLowerCase().replace(/\s+/g, '-')}.art`,
		);
		const actualBranch = await getCurrentBranch(join(root, location));
		saveCheckoutRecord(
			recordFile,
			{
				name: repoName,
				location,
				branch: actualBranch || 'main',
			},
			config,
			root,
		);
		return true;
	} catch (err) {
		console.error(`clone failed: ${err instanceof Error ? err.message : String(err)}`);
		return false;
	}
}

export async function runClone({ root, all, name, target }: CloneOptions): Promise<void> {
	const config = await loadWorkspaceConfig(root);
	const store = createCheckoutStore(config, root);
	const repos = loadRepositories(config, root);
	const existingCheckouts = loadCheckouts(config, root);

	if (all) {
		// Clone all repos
		for (const repo of repos) {
			const override = existingCheckouts.find(c => c.repo.name === repo.name);
			const location = override?.location ?? join(config.clone.path, repo.name.toLowerCase().replace(/\s+/g, '-'));
			store.addCheckout(repo, location);
		}
		
		// Clone repos that don't exist
		for (const checkout of store.getAllCheckouts()) {
			await scanCheckout(store, checkout.name, root);
			const scanned = store.getCheckout(checkout.name);
			if (!scanned?.exists && checkout.repo) {
				const success = await cloneRepo(checkout.name, checkout.location, checkout.repo.remote, config, root);
				if (success) {
					await scanCheckout(store, checkout.name, root);
				}
			}
		}
		
		presentCheckoutStatus(store);
		return;
	}

	if (name) {
		// Clone specific repo
		const repo = repos.find(r => r.name === name);
		if (!repo) {
			console.error(`clone: unknown repo "${name}"`);
			process.exitCode = 1;
			return;
		}

		const override = existingCheckouts.find(c => c.repo.name === name);
		const location = target ?? override?.location ?? join(config.clone.path, name.toLowerCase().replace(/\s+/g, '-'));
		store.addCheckout(repo, location);
		await scanCheckout(store, name, root);

		const checkout = store.getCheckout(name);
		if (!checkout?.exists) {
			const success = await cloneRepo(name, location, repo.remote, config, root);
			if (!success) {
				process.exitCode = 1;
				return;
			}
			await scanCheckout(store, name, root);
		}

		presentCheckoutStatus(store);
		return;
	}

	// Neither --all nor name: report status like sanity
	store.loadExistingCheckouts();
	await scanAllCheckouts(store, root);
	await scanExtraneousCheckouts(store, config, root);
	presentCheckoutStatus(store);
}
