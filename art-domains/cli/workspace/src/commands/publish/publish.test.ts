import { describe, expect, it, vi } from 'vitest';

import { runPublish } from './publish';

describe('publish command', () => {
	it('is a placeholder', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await runPublish({ root: '/tmp' });

		expect(info).toHaveBeenCalledWith('publish command - TODO');
	});
});
