import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { PackageRecord, PackageStateRecord } from '../resources/types';

export function createPackageStateRecord(
	checkoutPath: string,
	projectPath: string,
	nsPath: string,
	pkg: PackageRecord,
): { pkgPath: string; record: PackageStateRecord } {
	let pkgPath = join(checkoutPath, projectPath, nsPath, pkg.path);
	let pkgJsonPath = join(pkgPath, 'package.json');

	if (!existsSync(pkgJsonPath)) {
		const altPath = join(checkoutPath, projectPath, pkg.path);
		const altPkgJsonPath = join(altPath, 'package.json');
		if (existsSync(altPkgJsonPath)) {
			pkgPath = altPath;
			pkgJsonPath = altPkgJsonPath;
		}
	}

	const record: PackageStateRecord = {
		canonicalName: pkg.canonicalName,
		version: null,
		publishedVersion: null,
		directory: pkgPath,
		states: [],
	};

	if (existsSync(pkgJsonPath)) {
		try {
			const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
			record.version = pkgJson.version ?? null;
		} catch {
			record.states.push('no package.json');
		}
	} else {
		record.states.push('no package.json');
	}

	return { pkgPath, record };
}
