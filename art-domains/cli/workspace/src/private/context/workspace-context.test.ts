import { describe, expect, it } from 'vitest';

import { makeConfig } from '../../test/make-config';
import { createOperationsLog } from '../log/operations-log';
import { createCheckoutStore } from '../store/checkout-store';

import { createWorkspaceContext } from './workspace-context';

describe('createWorkspaceContext', () => {
	it('creates context with config, root, store, and log', () => {
		const config = makeConfig('.');
		const store = createCheckoutStore();
		const log = createOperationsLog();

		const ctx = createWorkspaceContext(config, store, log);

		expect(ctx.config).toBe(config);
		expect(ctx.config.root.path).toBe('.');
		expect(ctx.store).toBe(store);
		expect(ctx.log).toBe(log);
	});
});
