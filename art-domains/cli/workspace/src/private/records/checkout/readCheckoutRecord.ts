import { existsSync, readFileSync } from 'node:fs';

import type { CheckoutRecord } from '../types';

export function readCheckoutRecord(file: string): CheckoutRecord {
	const defaults: CheckoutRecord = {
		name: '',
		location: '',
		branch: 'main',
	};

	if (!existsSync(file)) {
		return defaults;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Checkout:\s*(.+)/);
	const repositoryMatch = content.match(/\*\*Repository:\*\*\s*(.+)/);
	const locationMatch = content.match(/\*\*Location:\*\*\s*`([^`]+)`/);
	const branchMatch = content.match(/\*\*Branch:\*\*\s*`([^`]+)`/);

	if (!nameMatch) {
		console.warn(`checkout record ${file}: missing name, using default`);
	}
	if (!locationMatch) {
		console.warn(`checkout record ${file}: missing location, using default`);
	}
	if (!branchMatch) {
		console.warn(`checkout record ${file}: missing branch, using default`);
	}

	return {
		name: nameMatch?.[1]?.trim() ?? defaults.name,
		repository: repositoryMatch?.[1]?.trim(),
		location: locationMatch?.[1]?.trim() ?? defaults.location,
		branch: branchMatch?.[1]?.trim() ?? defaults.branch,
	};
}
