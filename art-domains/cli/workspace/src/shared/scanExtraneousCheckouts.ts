import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import type { WorkspaceContext } from '../private/context/createWorkspaceContext';

import { scanCheckoutState } from './scanCheckoutState';

export async function scanExtraneousCheckouts(ctx: WorkspaceContext): Promise<void> {
	const checkoutsPath = join(ctx.config.root.path, ctx.config.clone.path);
	const recordedLocations = ctx.store.getAllCheckouts().map(c => c.record.location);

	try {
		const entries = await readdir(checkoutsPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}
			const dir = join(checkoutsPath, entry.name);
			const location = relative(checkoutsPath, dir);

			if (!recordedLocations.includes(location)) {
				const checkout = ctx.store.markExtraneous(ctx.config, location);
				await scanCheckoutState(ctx, checkout);
			}
		}
	} catch {
		// checkouts path doesn't exist or can't be read
	}
}
