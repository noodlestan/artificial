import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { NamespaceRecord } from '../types';

import { readNamespaceRecord } from './readNamespaceRecord';

export function readNamespaceRecords(dir: string): NamespaceRecord[] {
	const namespacesDir = join(dir, 'namespaces');
	if (!existsSync(namespacesDir)) {
		return [];
	}
	const files = readdirSync(namespacesDir).filter(f => f.endsWith('.art'));
	return files
		.map(f => readNamespaceRecord(join(namespacesDir, f)))
		.filter((r): r is NamespaceRecord => r !== null);
}
