import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeMockConfig } from '../../test/helpers/context/makeMockConfig';
import { makeTempDir } from '../../test/helpers/tempDirs/makeTempDir';
import { removeTempDirs } from '../../test/helpers/tempDirs/removeTempDirs';

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
		const config = makeMockConfig(tempDir);

		presentCheckoutReport(config, []);

		expect(spy).toHaveBeenCalledWith('Checkouts:');
	});
});
