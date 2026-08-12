import { describe, expect, it } from 'vitest';

import { makeConfig } from '../test/makeConfig';

import { defineConfig } from './index';

describe('defineConfig', () => {
	it('returns the input config unchanged', () => {
		const config = makeConfig('.');

		expect(defineConfig(config)).toEqual(config);
	});
});
