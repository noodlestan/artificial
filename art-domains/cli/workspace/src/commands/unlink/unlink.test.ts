import { describe, expect, it, vi } from 'vitest';

import { runUnlink } from './runUnlink';

describe('unlink command', () => {
	it('is a placeholder', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await runUnlink({ root: '/tmp' });

		expect(info).toHaveBeenCalledWith('unlink command - TODO');
	});
});
