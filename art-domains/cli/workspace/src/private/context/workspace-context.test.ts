import { describe, expect, it } from 'vitest';

import { makeConfig } from '../../test/make-config';
import { createOperationsLog } from '../log/createOperationsLog';
import { createCheckoutStore } from '../store/createCheckoutStore';

import { createWorkspaceContext } from './createWorkspaceContext';

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
