import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentPackageStateReport } from '../../private/present/presentPackageStateReport';
import { presentRepositoryState } from '../../private/present/presentRepositoryState';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadProjectGraph } from '../../private/records/projectGraph/loadProjectGraph';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import type { PackageStateRecord, ProjectGraph } from '../../private/records/types';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';

export interface CheckoutRepositoryState {
	target: import('../../private/store/types').Checkout;
	branch: string | null;
	issues: string[];
	graph: ProjectGraph;
}

export async function runRepo(
	ctx: WorkspaceContext,
	options: { checkoutNames: string[] },
): Promise<void> {
	const repos = await loadRepositoryRecords(ctx.config);
	const records = await loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);
	await scanAllCheckoutsStates(ctx.store);

	const { checkoutNames } = options;

	let targets;
	if (checkoutNames.length === 0) {
		targets = ctx.store.getAllCheckouts();
	} else {
		targets = [];
		for (const name of checkoutNames) {
			const checkout = ctx.store.getCheckoutByName(name);
			if (!checkout) {
				console.warn(`unknown checkout: ${name}`);
				continue;
			}
			targets.push(checkout);
		}
	}

	const allPackageStates = new Map<string, PackageStateRecord[]>();
	const repositoryStates: CheckoutRepositoryState[] = [];

	for (const checkout of targets) {
		const graph = await loadProjectGraph(ctx.config, checkout.path);
		const repositoryState: CheckoutRepositoryState = {
			target: checkout,
			branch: checkout.scan?.state('remote').branch ?? checkout.record.branch,
			issues: [],
			graph,
		};
		repositoryStates.push(repositoryState);

		for (const w of graph.warnings) {
			console.warn(w);
		}

		if (graph.projects.length === 0) {
			repositoryState.issues.push('no project records');
			continue;
		}

		const packageStates: PackageStateRecord[] = [];

		for (const project of graph.projects) {
			for (const nsName of project.namespaceNames) {
				const ns = graph.namespaces.get(nsName);
				if (!ns) continue;
				for (const pkgName of ns.packageNames) {
					const pkg = graph.packages.get(pkgName);
					if (!pkg) continue;

					let pkgPath = join(checkout.path, project.path, ns.path, pkg.path);
					let pkgJsonPath = join(pkgPath, 'package.json');

					if (!existsSync(pkgJsonPath)) {
						const altPath = join(checkout.path, project.path, pkg.path);
						const altPkgJsonPath = join(altPath, 'package.json');
						if (existsSync(altPkgJsonPath)) {
							pkgPath = altPath;
							pkgJsonPath = altPkgJsonPath;
						}
					}

					let version: string | null = null;
					const states: string[] = [];

					if (existsSync(pkgJsonPath)) {
						try {
							const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
							version = pkgJson.version ?? null;
						} catch {
							states.push('no package.json');
						}
					} else {
						states.push('no package.json');
					}

					let publishedVersion: string | null = null;
					if (version !== null && version !== '0.0.0') {
						try {
							const output = execSync(`npm info ${pkg.canonicalName} version`, {
								encoding: 'utf-8',
								timeout: 10000,
								stdio: ['pipe', 'pipe', 'ignore'],
							});
							publishedVersion = output.trim() || null;
						} catch {
							publishedVersion = 'unknown';
						}
					}

					packageStates.push({
						canonicalName: pkg.canonicalName,
						version,
						publishedVersion,
						directory: pkgPath,
						states,
					});
				}
			}
		}

		allPackageStates.set(checkout.record.name, packageStates);
	}

	presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts());
	for (const state of repositoryStates) presentRepositoryState(state);
	for (const checkout of targets) {
		const packageStates = allPackageStates.get(checkout.record.name) ?? [];
		presentPackageStateReport(checkout, packageStates);
	}
}
