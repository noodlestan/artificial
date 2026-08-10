import { describe, expect, it } from 'vitest';

import { createCheckout } from './checkout';
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

describe('createCheckout', () => {
	it('creates a checkout with default values', () => {
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };
		const checkout = createCheckout(repo, 'repos/test', 'main');

		expect(checkout.repo.name).toBe('Test');
		expect(checkout.record.location).toBe('repos/test');
		expect(checkout.record.branch).toBe('main');
		expect(checkout.exists).toBe(false);
		expect(checkout.issues).toEqual([]);
	});
});

describe('createCheckoutStore', () => {
	it('adds and retrieves a checkout', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };

		store.addCheckout(repo, 'repos/test');

		const checkout = store.getCheckout('test');
		expect(checkout).toBeDefined();
		expect(checkout?.repo.name).toBe('Test');
	});

	it('findCheckout is case-insensitive', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };

		store.addCheckout(repo, 'repos/test');

		expect(store.findCheckout('TEST')).toBeDefined();
		expect(store.findCheckout('Test')).toBeDefined();
		expect(store.findCheckout('test')).toBeDefined();
	});

	it('findCheckout strips package scope', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'test', remote: 'git@example.com:test.git' };

		store.addCheckout(repo, 'repos/test');

		expect(store.findCheckout('@scope/test')).toBeDefined();
	});

	it('setCheckout replaces existing checkout', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };
		const checkout = store.addCheckout(repo, 'repos/test');

		const updated = { ...checkout, exists: true };
		store.setCheckout(updated);

		expect(store.getCheckout('test')?.exists).toBe(true);
	});

	it('getExtraneous returns only extraneous checkouts', () => {
		const store = createCheckoutStore(makeConfig(), '/tmp');
		const repo = { name: 'Test', remote: 'git@example.com:test.git' };
		store.addCheckout(repo, 'repos/test');
		store.markExtraneous('repos/extras');

		const extraneous = store.getExtraneous();
		expect(extraneous).toHaveLength(1);
		expect(extraneous[0].extraneous).toBe(true);
	});
});

describe('createOperationsLog', () => {
	it('records cloned operation', () => {
		const log = createOperationsLog();

		log.cloned('test', 'to repos/test');

		const ops = log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('cloned');
		expect(ops[0].repo).toBe('test');
	});

	it('returns empty array when no operations', () => {
		const log = createOperationsLog();

		expect(log.all()).toEqual([]);
	});

	it('since filters by timestamp', async () => {
		const log = createOperationsLog();
		log.cloned('a', 'detail a');
		const before = new Date(Date.now() + 10);
		await new Promise(resolve => setTimeout(resolve, 15));
		log.cloned('b', 'detail b');

		const ops = log.since(before);
		expect(ops).toHaveLength(1);
		expect(ops[0].repo).toBe('b');
	});

	it('latest returns last n operations', () => {
		const log = createOperationsLog();
		log.cloned('a', 'a');
		log.cloned('b', 'b');
		log.cloned('c', 'c');

		const ops = log.latest(2);
		expect(ops).toHaveLength(2);
		expect(ops[0].repo).toBe('b');
		expect(ops[1].repo).toBe('c');
	});
});

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
