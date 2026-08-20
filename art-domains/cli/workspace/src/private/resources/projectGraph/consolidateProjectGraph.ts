import type { NamespaceRecord, PackageRecord, ProjectGraph, ProjectRecord } from '../types';

export function consolidateProjectGraph(
	projects: ProjectRecord[],
	namespaces: NamespaceRecord[],
	packages: PackageRecord[],
): ProjectGraph {
	const warnings: string[] = [];
	const nsMap = new Map<string, NamespaceRecord>();
	const pkgMap = new Map<string, PackageRecord>();

	for (const ns of namespaces) {
		nsMap.set(ns.name, ns);
	}
	for (const pkg of packages) {
		pkgMap.set(pkg.name, pkg);
	}

	for (const project of projects) {
		for (const nsName of project.namespaceNames) {
			if (!nsMap.has(nsName)) {
				warnings.push(`unknown namespace: ${nsName}`);
			}
		}
		for (const ns of namespaces) {
			if (!project.namespaceNames.includes(ns.name)) continue;
			for (const pkgName of ns.packageNames) {
				if (!pkgMap.has(pkgName)) {
					warnings.push(`unknown package: ${pkgName}`);
				}
			}
		}
	}

	return { projects, namespaces: nsMap, packages: pkgMap, warnings };
}
