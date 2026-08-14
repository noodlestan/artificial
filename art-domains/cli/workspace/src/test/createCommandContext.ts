import {
	WorkspaceContext,
	createWorkspaceContext,
} from '../private/context/createWorkspaceContext';
import { createOperationsLog } from '../private/log/createOperationsLog';
import type { Checkout } from '../private/store/createCheckout';
import { createCheckoutStore } from '../private/store/createCheckoutStore';

import { makeConfig } from './makeConfig';

export function createCommandContext(tempDir: string, workspace?: Checkout): WorkspaceContext {
	const config = makeConfig(tempDir);
	const store = createCheckoutStore();
	const log = createOperationsLog();
	const ctx = createWorkspaceContext(config, store, log, workspace);
	return ctx;
}
