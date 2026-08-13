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
	const namespacesMatch = content.match(/\*\*Namespaces:\*\*\s*(.+)/);

	return {
		name: nameMatch[1].trim(),
		path: pathMatch?.[1]?.trim() ?? '.',
		namespaceNames: namespacesMatch
			? namespacesMatch[1]
					.split(',')
					.map(s => s.trim())
					.filter(Boolean)
			: [],
	};
}
