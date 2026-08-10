import { loadWorkspaceConfig } from '../config/load-config';
import { createCheckoutStore } from '../shared/checkout-store';
import { createOperationsLog } from '../shared/operations-log';
import { createWorkspaceContext } from '../shared/workspace-context';

import { cloneAll } from './clone-all';
import { cloneSpecific } from './clone-specific';
import { cloneStatus } from './clone-status';

interface CloneOptions {
	root: string;
	all?: boolean;
	name?: string;
	target?: string;
}

export async function runClone({ root, all, name, target }: CloneOptions): Promise<void> {
	const config = await loadWorkspaceConfig(root);
	const store = createCheckoutStore(config, root);
	const log = createOperationsLog();
	const ctx = createWorkspaceContext(config, root, store, log);

	if (all) {
		await cloneAll(ctx);
		return;
	}

	if (name) {
		await cloneSpecific(ctx, name, target);
		return;
	}

	await cloneStatus(ctx);
}
