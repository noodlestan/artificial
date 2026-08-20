import type { PackageStateRecord, ProjectGraph } from '../resources/types';

import { createPackageStateRecord } from './createPackageStateRecord';
import { scanPackageStateRecord } from './scanPackageStateRecord';

export function getRepositoryCheckoutPackages(
	checkoutPath: string,
	graph: ProjectGraph,
): PackageStateRecord[] {
	const packageStates: PackageStateRecord[] = [];

	for (const project of graph.projects) {
		for (const nsName of project.namespaceNames) {
			const ns = graph.namespaces.get(nsName);
			if (!ns) continue;
			for (const pkgName of ns.packageNames) {
				const pkg = graph.packages.get(pkgName);
				if (!pkg) continue;

				const { record } = createPackageStateRecord(checkoutPath, project.path, ns.path, pkg);
				scanPackageStateRecord(pkg, record);
				packageStates.push(record);
			}
		}
	}

	return packageStates;
}
