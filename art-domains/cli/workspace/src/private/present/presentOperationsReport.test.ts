import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCommandContext } from '../../test/createCommandContext';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { createOperationsLog } from '../log/createOperationsLog';
import { createCloneSuccess } from '../operations/createCloneSuccess';
import { createCheckout } from '../store/createCheckout';

import { presentOperationsReport } from './presentOperationsReport';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
	vi.restoreAllMocks();
});

describe('presentOperationsReport', () => {
	it('no output when the log is empty', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const log = createOperationsLog();

		presentOperationsReport(log);

		expect(spy).not.toHaveBeenCalled();
	});

	it('prints Operations Report: when operations exist', () => {
		const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
		const log = createOperationsLog();
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const checkout = createCheckout(ctx.config, 'my-repo', {
			name: 'MyRepo',
			remote: 'git@example.com:my-repo.git',
		});
		log.log(createCloneSuccess(checkout));

		presentOperationsReport(log);

		expect(spy).toHaveBeenCalledWith('Operations Report:');
	});
});
