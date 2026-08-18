import { describe, expect, it } from 'vitest';

import { makeMockConfig } from '../test/helpers/context/makeMockConfig';

import { defineConfig } from './index';

describe('defineConfig', () => {
	it('returns the input config unchanged', () => {
		const config = makeMockConfig('.');

		expect(defineConfig(config)).toEqual(config);
	});
});
