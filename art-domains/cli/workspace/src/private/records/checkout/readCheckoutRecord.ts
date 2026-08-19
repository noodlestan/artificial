import { existsSync, readFileSync } from 'node:fs';

import type { CheckoutRecord } from '../types';

export function readCheckoutRecord(file: string): CheckoutRecord | null {
	if (!existsSync(file)) {
		return null;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Checkout:\s*(.+)/);
	if (!nameMatch) {
		return null;
	}

	const repositoryMatch = content.match(/\*\*Repository:\*\*\s*(.+)/);
	const locationMatch = content.match(/\*\*Location:\*\*\s*`([^`]+)`/);
	const branchMatch = content.match(/\*\*Branch:\*\*\s*`([^`]+)`/);

	if (!locationMatch) {
		console.warn(`checkout record ${file}: missing location, using default`);
	}
	if (!branchMatch) {
		console.warn(`checkout record ${file}: missing branch, using default`);
	}

	return {
		name: nameMatch[1]?.trim() ?? '',
		repository: repositoryMatch?.[1]?.trim(),
		location: locationMatch?.[1]?.trim() ?? '',
		branch: branchMatch?.[1]?.trim() ?? 'main',
	};
}
