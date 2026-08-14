import type { WorkspaceConfig } from '../../config/types';
import type { OperationsLog } from '../log/createOperationsLog';
import type { Checkout } from '../store/createCheckout';
import { CheckoutStore } from '../store/createCheckoutStore';

export interface WorkspaceContext {
	config: WorkspaceConfig;
	store: CheckoutStore;
	log: OperationsLog;
	workspace?: Checkout;
}

export function createWorkspaceContext(
	config: WorkspaceConfig,
	store: CheckoutStore,
	log: OperationsLog,
	workspace?: Checkout,
): WorkspaceContext {
	return { config, store, log, workspace };
}
