import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { WorkspaceConfig } from '../../config';

import { readRepositoryRecord } from './readRepositoryRecord';
import { RepositoryRecord } from './types';

export function loadRepositoryRecords(config: WorkspaceConfig): RepositoryRecord[] {
	const dir = join(config.root.path, config.records.repositories.path);
	if (!existsSync(dir)) {
		return [];
	}
	const files = readdirSync(dir).filter(f => f.endsWith('.art'));
	return files.map(f => readRepositoryRecord(join(dir, f)));
}
