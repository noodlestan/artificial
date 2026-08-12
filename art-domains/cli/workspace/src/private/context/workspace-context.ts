import type { WorkspaceConfig } from '../../config/types';
import type { OperationsLog } from '../log/operations-log';
import { CheckoutStore } from '../store/checkout-store';

export interface WorkspaceContext {
	config: WorkspaceConfig;
	store: CheckoutStore;
	log: OperationsLog;
}

export function createWorkspaceContext(
	config: WorkspaceConfig,
	store: CheckoutStore,
	log: OperationsLog,
): WorkspaceContext {
	return { config, store, log };
}
