import { describe, expect, it } from 'vitest';

import { createCheckoutStore } from './checkout-store';
import { createOperationsLog } from './operations-log';
import { createWorkspaceContext } from './workspace-context';

function makeConfig() {
	return {
		clone: { path: 'repos' },
		records: {
			repositories: { path: 'ops/records/repositories' },
			checkouts: { path: 'ops/records/checkouts', template: 'checkout.art.njk' },
		},
	};
}

describe('createWorkspaceContext', () => {
	it('creates context with config, root, store, and log', () => {
		const config = makeConfig();
		const store = createCheckoutStore(config, '/root');
		const log = createOperationsLog();

		const ctx = createWorkspaceContext(config, '/root', store, log);

		expect(ctx.config).toBe(config);
		expect(ctx.root).toBe('/root');
		expect(ctx.store).toBe(store);
		expect(ctx.log).toBe(log);
	});
});
