import { existsSync, readFileSync } from 'node:fs';

import type { PackageRecord } from '../types';

export function readPackageRecord(file: string): PackageRecord | null {
	if (!existsSync(file)) {
		return null;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Package:\s*(.+)/);
	if (!nameMatch) {
		console.warn(`package record ${file}: missing name, skipped`);
		return null;
	}

	const canonicalNameMatch = content.match(/\*\*Canonical Name:\*\*\s*`([^`]+)`/);
	const pathMatch = content.match(/\*\*Path:\*\*\s*`([^`]+)`/);

	return {
		name: nameMatch[1].trim(),
		canonicalName: canonicalNameMatch?.[1]?.trim() ?? '',
		path: pathMatch?.[1]?.trim() ?? '',
	};
}
