import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { PackageRecord } from '../types';

import { readPackageRecord } from './readPackageRecord';

export function readPackageRecords(dir: string): PackageRecord[] {
	const packagesDir = join(dir, 'packages');
	if (!existsSync(packagesDir)) {
		return [];
	}
	const files = readdirSync(packagesDir).filter(f => f.endsWith('.art'));
	return files
		.map(f => readPackageRecord(join(packagesDir, f)))
		.filter((r): r is PackageRecord => r !== null);
}
