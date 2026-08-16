import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import type { WorkspaceConfig } from '../../../config/types';
import { scanCheckoutState } from '../../../private/scan/scanCheckoutState';
import type { Checkout } from '../../../private/store/createCheckout';

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

			const checkout: Checkout = {
				repo: undefined,
				record: { name: location, location, branch: '', repository: undefined },
				path: dir,
				exists: true,
				remoteBranch: null,
				detached: false,
				conflicts: false,
				dirty: false,
				hasRemote: false,
				unpushed: 0,
				isBehind: false,
				issues: [],
				extraneous: true,
			};
			const scanned = await scanCheckoutState(checkout);
			result.push(scanned);
		}
	} catch {
		// checkouts path doesn't exist or can't be read
	}

	return result;
}
