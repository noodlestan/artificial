import type { WorkspaceConfig } from '../../../config';
import { loadNamespaceRecords } from '../namespace/loadNamespaceRecords';
import { loadPackageRecords } from '../package/loadPackageRecords';
import { loadProjectRecords } from '../project/loadProjectRecords';
import type { ProjectGraph } from '../types';

import { consolidateProjectGraph } from './consolidateProjectGraph';

export async function loadProjectGraph(
	config: WorkspaceConfig,
	checkoutPath: string,
): Promise<ProjectGraph> {
	const [projects, namespaces, packages] = await Promise.all([
		loadProjectRecords(config, checkoutPath),
		loadNamespaceRecords(config, checkoutPath),
		loadPackageRecords(config, checkoutPath),
	]);
	return consolidateProjectGraph(projects, namespaces, packages);
}
