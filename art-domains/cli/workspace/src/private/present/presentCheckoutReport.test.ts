import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeConfig } from '../../test/makeConfig';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';

import { presentCheckoutReport } from './presentCheckoutReport';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('presentCheckoutReport', () => {
	it('calls console.info with Checkouts:', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const tempDir = makeTempDir(tempDirs);
		const config = makeConfig(tempDir);

		presentCheckoutReport(config, []);

		expect(spy).toHaveBeenCalledWith('Checkouts:');
	});
});
