import type { WorkspaceConfig } from '../config/types';
import type { CheckoutStore } from './checkout-store';
import type { OperationsLog } from './operations-log';

export interface WorkspaceContext {
	config: WorkspaceConfig;
	root: string;
	store: CheckoutStore;
	log: OperationsLog;
}

export function createWorkspaceContext(
	config: WorkspaceConfig,
	root: string,
	store: CheckoutStore,
	log: OperationsLog,
): WorkspaceContext {
	return { config, root, store, log };
}
