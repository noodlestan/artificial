import { describe, expect, it, vi } from 'vitest';

import { runBranch } from './branch';

describe('branch command', () => {
	it('is a placeholder', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await runBranch({ root: '/tmp' });

		expect(info).toHaveBeenCalledWith('branch command - TODO');
	});
});
