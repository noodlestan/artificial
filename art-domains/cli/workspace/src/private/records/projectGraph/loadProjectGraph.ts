import { join } from 'node:path';

import { readNamespaceRecords } from '../namespace/readNamespaceRecords';
import { readPackageRecords } from '../package/readPackageRecords';
import { readProjectRecords } from '../project/readProjectRecords';
import type { ProjectGraph } from '../types';

import { consolidateProjectGraph } from './consolidateProjectGraph';

export function loadProjectGraph(checkoutPath: string): ProjectGraph {
	const recordsDir = join(checkoutPath, 'ops/records');
	const projects = readProjectRecords(recordsDir);
	const namespaces = readNamespaceRecords(recordsDir);
	const packages = readPackageRecords(recordsDir);
	return consolidateProjectGraph(projects, namespaces, packages);
}
