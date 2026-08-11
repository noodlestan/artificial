import { describe, expect, it, vi } from 'vitest';

import { runLink } from './link';

describe('link command', () => {
	it('is a placeholder', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await runLink({ root: '/tmp' });

		expect(info).toHaveBeenCalledWith('link command - TODO');
	});
});
