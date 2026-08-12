import { WorkspaceContext, createWorkspaceContext } from '../private/context/workspace-context';
import { createOperationsLog } from '../private/log/operations-log';
import { createCheckoutStore } from '../private/store/checkout-store';

import { makeConfig } from './make-config';

export function createCommandContext(tempDir: string): WorkspaceContext {
	const config = makeConfig(tempDir);
	const store = createCheckoutStore();
	const log = createOperationsLog();
	const ctx = createWorkspaceContext(config, store, log);
	return ctx;
}
