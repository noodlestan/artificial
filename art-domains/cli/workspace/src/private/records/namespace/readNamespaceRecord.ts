import { existsSync, readFileSync } from 'node:fs';

import type { NamespaceRecord } from '../types';

export function readNamespaceRecord(file: string): NamespaceRecord | null {
	if (!existsSync(file)) {
		return null;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Namespace:\s*(.+)/);
	if (!nameMatch) {
		console.warn(`namespace record ${file}: missing name, skipped`);
		return null;
	}

	const pathMatch = content.match(/\*\*Path:\*\*\s*`([^`]+)`/);
	const packagesMatch = content.match(/\*\*Packages:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/);

	let packageNames: string[] = [];
	if (packagesMatch) {
		packageNames = packagesMatch[1]
			.split('\n')
			.map(line => line.replace(/^-\s*Package:\s*/, '').trim())
			.filter(Boolean);
	}

	return {
		kind: 'namespace',
		name: nameMatch[1].trim(),
		path: pathMatch?.[1]?.trim() ?? '.',
		packageNames,
	};
}
