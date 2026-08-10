import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { RepositoryRecord, WorkspaceConfig } from '../../config/types';

export function readRepositoryRecord(file: string): RepositoryRecord {
	const defaults: RepositoryRecord = { name: '', remote: '' };

	if (!existsSync(file)) {
		return defaults;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Repository:\s*(.+)/);
	const remoteMatch = content.match(/\*\*Remote:\*\*\s*`([^`]+)`/);
	const purposeMatch = content.match(/\*\*Purpose:\*\*\s*(.+)/);
	const descriptionMatch = content.match(/\*\*Description:\*\*\s*(.+)/);
	const consumersMatch = content.match(/\*\*Consumers:\*\*\s*(.+)/);

	if (!nameMatch) {
		console.warn(`repository record ${file}: missing name, using default`);
	}
	if (!remoteMatch) {
		console.warn(`repository record ${file}: missing remote, using default`);
	}

	return {
		name: nameMatch?.[1]?.trim() ?? defaults.name,
		remote: remoteMatch?.[1]?.trim() ?? defaults.remote,
		...(purposeMatch ? { purpose: purposeMatch[1].trim() } : {}),
		...(descriptionMatch ? { description: descriptionMatch[1].trim() } : {}),
		...(consumersMatch ? { consumers: consumersMatch[1].trim() } : {}),
	};
}

export function loadRepositories(config: WorkspaceConfig, root: string): RepositoryRecord[] {
	const dir = join(root, config.records.repositories.path);
	if (!existsSync(dir)) {
		return [];
	}
	const files = readdirSync(dir).filter(f => f.endsWith('.art'));
	return files.map(f => readRepositoryRecord(join(dir, f)));
}
