import type { WorkspaceConfig } from '../../config/types';
import type { OperationsLog } from '../log/createOperationsLog';
import { CheckoutStore } from '../store/createCheckoutStore';

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
