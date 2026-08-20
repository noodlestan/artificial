import { readRecordFileContent } from '../../records/readRecordFileContent';
import type { RecordFile } from '../../records/types';
import type { NamespaceRecord } from '../types';

export async function readNamespaceRecord(file: RecordFile): Promise<NamespaceRecord | null> {
	const fileWithContents = file.content ? file : await readRecordFileContent(file);
	if (!fileWithContents.content) {
		return null;
	}

	const content = fileWithContents.content;

	const nameMatch = content.match(/## Namespace:\s*(.+)/);
	if (!nameMatch) {
		console.warn(`namespace record ${file.filename}: missing name, skipped`);
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
