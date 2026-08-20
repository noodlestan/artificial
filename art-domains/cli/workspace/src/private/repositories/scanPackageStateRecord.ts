import { execSync } from 'node:child_process';

import type { PackageRecord, PackageStateRecord } from '../resources/types';

export function scanPackageStateRecord(pkg: PackageRecord, record: PackageStateRecord): void {
	if (record.version !== null && record.version !== '0.0.0') {
		try {
			const output = execSync(`npm info ${pkg.canonicalName} version`, {
				encoding: 'utf-8',
				timeout: 10000,
				stdio: ['pipe', 'pipe', 'ignore'],
			});
			record.publishedVersion = output.trim() || null;
		} catch {
			record.publishedVersion = 'unknown';
		}
	}
}
