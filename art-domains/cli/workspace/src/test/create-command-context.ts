import {
	WorkspaceContext,
	createWorkspaceContext,
} from '../private/context/createWorkspaceContext';
import { createOperationsLog } from '../private/log/createOperationsLog';
import { createCheckoutStore } from '../private/store/createCheckoutStore';

import { makeConfig } from './make-config';

export function createCommandContext(tempDir: string): WorkspaceContext {
	const config = makeConfig(tempDir);
	const store = createCheckoutStore();
	const log = createOperationsLog();
	const ctx = createWorkspaceContext(config, store, log);
	return ctx;
}
