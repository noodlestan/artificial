import { existsSync, readFileSync } from 'node:fs';

import type { ProjectRecord } from '../types';

export function readProjectRecord(file: string): ProjectRecord | null {
	if (!existsSync(file)) {
		return null;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Project:\s*(.+)/);
	if (!nameMatch) {
		console.warn(`project record ${file}: missing name, skipped`);
		return null;
	}

	const pathMatch = content.match(/\*\*Path:\*\*\s*`([^`]+)`/);
	const namespacesMatch = content.match(/\*\*Namespaces:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/);

	let namespaceNames: string[] = [];
	if (namespacesMatch) {
		namespaceNames = namespacesMatch[1]
			.split('\n')
			.map(line => line.replace(/^-\s*Namespace:\s*/, '').trim())
			.filter(Boolean);
	}

	return {
		kind: 'project',
		name: nameMatch[1].trim(),
		path: pathMatch?.[1]?.trim() ?? '.',
		namespaceNames,
	};
}
