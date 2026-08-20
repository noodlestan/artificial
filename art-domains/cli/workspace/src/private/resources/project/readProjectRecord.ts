import { readRecordFileContent } from '../../records/readRecordFileContent';
import type { RecordFile } from '../../records/types';
import type { ProjectRecord } from '../types';

export async function readProjectRecord(file: RecordFile): Promise<ProjectRecord | null> {
	const fileWithContents = file.content ? file : await readRecordFileContent(file);
	if (!fileWithContents.content) {
		return null;
	}

	const content = fileWithContents.content;

	const nameMatch = content.match(/## Project:\s*(.+)/);
	if (!nameMatch) {
		console.warn(`project record ${file.filename}: missing name, skipped`);
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
