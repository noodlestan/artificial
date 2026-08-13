import type { PackageRecord, ProjectGraph } from '../types';

export function findPackage(
	graph: ProjectGraph,
	packageName: string,
): { package: PackageRecord; projectPath: string; namespacePath: string } | null {
	for (const project of graph.projects) {
		for (const nsName of project.namespaceNames) {
			const ns = graph.namespaces.get(nsName);
			if (!ns) continue;
			for (const pkgName of ns.packageNames) {
				const pkg = graph.packages.get(pkgName);
				if (!pkg) continue;
				if (pkg.canonicalName === packageName || pkg.name === packageName) {
					return { package: pkg, projectPath: project.path, namespacePath: ns.path };
				}
			}
		}
	}
	return null;
}
