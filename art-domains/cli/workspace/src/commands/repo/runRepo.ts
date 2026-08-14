import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
import { presentPackageStateReport } from '../../private/present/presentPackageStateReport';
import { loadCheckoutRecords } from '../../private/records/checkout/loadCheckoutRecords';
import { loadProjectGraph } from '../../private/records/projectGraph/loadProjectGraph';
import { loadRepositoryRecords } from '../../private/records/repository/loadRepositoryRecords';
import type { PackageStateRecord } from '../../private/records/types';
import { scanAllCheckoutsStates } from '../../private/scan/scanAllCheckoutsStates';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';

export async function runRepo(
	ctx: WorkspaceContext,
	options: { checkoutNames: string[] },
): Promise<void> {
	const repos = loadRepositoryRecords(ctx.config);
	const records = loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx, records);
	await scanAllCheckoutsStates(ctx);

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

	for (const checkout of targets) {
		const graph = loadProjectGraph(checkout.path);

		for (const w of graph.warnings) {
			console.warn(w);
		}

		if (graph.projects.length === 0) {
			const updated = { ...checkout, issues: [...checkout.issues, 'no project records'] };
			ctx.store.updateCheckout(updated);
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

	presentCheckoutReport(ctx);
	for (const checkout of targets) {
		const packageStates = allPackageStates.get(checkout.record.name) ?? [];
		presentPackageStateReport(checkout, packageStates);
	}
}
