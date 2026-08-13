import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { ProjectRecord } from '../types';

import { readProjectRecord } from './readProjectRecord';

export function readProjectRecords(dir: string): ProjectRecord[] {
	const projectsDir = join(dir, 'projects');
	if (!existsSync(projectsDir)) {
		return [];
	}
	const files = readdirSync(projectsDir).filter(f => f.endsWith('.art'));
	return files
		.map(f => readProjectRecord(join(projectsDir, f)))
		.filter((r): r is ProjectRecord => r !== null);
}
