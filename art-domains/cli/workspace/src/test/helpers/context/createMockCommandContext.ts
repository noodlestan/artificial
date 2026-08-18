import {
	WorkspaceContext,
	createWorkspaceContext,
} from '../../../private/context/createWorkspaceContext';
import { createOperationsLog } from '../../../private/log/createOperationsLog';
import type { Checkout } from '../../../private/store/createCheckout';
import { createCheckoutStore } from '../../../private/store/createCheckoutStore';

import { makeMockConfig } from './makeMockConfig';

export function createMockCommandContext(tempDir: string, workspace?: Checkout): WorkspaceContext {
	const config = makeMockConfig(tempDir);
	const store = createCheckoutStore();
	const log = createOperationsLog();
	const ctx = createWorkspaceContext(config, store, log, workspace);
	return ctx;
}
