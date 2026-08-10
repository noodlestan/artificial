import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { readRepositoryRecord } from '../private/records/repository-record';

import type { WorkspaceConfig } from './types';

export function loadRepositories(
	config: WorkspaceConfig,
	root: string,
): import('./types').RepositoryRecord[] {
	const dir = join(root, config.records.repositories.path);
	if (!existsSync(dir)) {
		return [];
	}
	const files = readdirSync(dir).filter(f => f.endsWith('.art'));
	return files.map(f => readRepositoryRecord(join(dir, f)));
}
