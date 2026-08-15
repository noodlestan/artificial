import { afterEach, describe, expect, it } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { createCheckout } from '../store/createCheckout';

import { isCleanCheckout } from './isCleanCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('isCleanCheckout', () => {
	it('returns false when the checkout does not exist', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'clean');

		expect(isCleanCheckout(checkout)).toBe(false);
	});

	it('returns false when the checkout is extraneous', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'clean');
		checkout.exists = true;
		checkout.extraneous = true;

		expect(isCleanCheckout(checkout)).toBe(false);
	});

	it('returns false when the checkout is dirty', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'clean');
		checkout.exists = true;
		checkout.dirty = true;

		expect(isCleanCheckout(checkout)).toBe(false);
	});

	it('returns false when the checkout has conflicts', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'clean');
		checkout.exists = true;
		checkout.conflicts = true;

		expect(isCleanCheckout(checkout)).toBe(false);
	});

	it('returns false when the checkout is detached', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'clean');
		checkout.exists = true;
		checkout.detached = true;

		expect(isCleanCheckout(checkout)).toBe(false);
	});

	it('returns true when the checkout is clean', () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'clean');
		checkout.exists = true;

		expect(isCleanCheckout(checkout)).toBe(true);
	});
});
