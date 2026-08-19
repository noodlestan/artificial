import { existsSync, readFileSync } from 'node:fs';

import type { RepositoryRecord } from '../types';

export function readRepositoryRecord(file: string): RepositoryRecord | null {
	if (!existsSync(file)) {
		return null;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Repository:\s*(.+)/);
	if (!nameMatch) {
		return null;
	}

	const remoteMatch = content.match(/\*\*Remote:\*\*\s*`([^`]+)`/);
	const purposeMatch = content.match(/\*\*Purpose:\*\*\s*(.+)/);
	const descriptionMatch = content.match(/\*\*Description:\*\*\s*(.+)/);
	const consumersMatch = content.match(/\*\*Consumers:\*\*\s*(.+)/);

	if (!remoteMatch) {
		console.warn(`repository record ${file}: missing remote, using default`);
	}

	return {
		name: nameMatch[1]?.trim() ?? '',
		remote: remoteMatch?.[1]?.trim() ?? '',
		...(purposeMatch ? { purpose: purposeMatch[1].trim() } : {}),
		...(descriptionMatch ? { description: descriptionMatch[1].trim() } : {}),
		...(consumersMatch ? { consumers: consumersMatch[1].trim() } : {}),
	};
}
