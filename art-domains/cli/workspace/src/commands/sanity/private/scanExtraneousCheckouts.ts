import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import type { WorkspaceConfig } from '../../../config/types';
import { createExtraneousCheckout } from '../../../private/scan/private/createExtraneousCheckout';
import { scanCheckoutState } from '../../../private/scan/scanCheckoutState';
import type { Checkout } from '../../../private/store/types';

export async function scanExtraneousCheckouts(config: WorkspaceConfig): Promise<Checkout[]> {
	const checkoutsPath = join(config.root.path, config.clone.path);
	const result: Checkout[] = [];

	try {
		const entries = await readdir(checkoutsPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}
			const dir = join(checkoutsPath, entry.name);
			const location = relative(checkoutsPath, dir);

			const checkout = { ...createExtraneousCheckout(config, location), path: dir };
			const scanned = await scanCheckoutState(checkout);
			result.push(scanned);
		}
	} catch {
		// checkouts path doesn't exist or can't be read
	}

	return result;
}
