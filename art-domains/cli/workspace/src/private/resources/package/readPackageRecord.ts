import { readRecordFileContent } from '../../records/readRecordFileContent';
import type { RecordFile } from '../../records/types';
import type { PackageRecord } from '../types';

export async function readPackageRecord(file: RecordFile): Promise<PackageRecord | null> {
	const fileWithContents = file.content ? file : await readRecordFileContent(file);
	if (!fileWithContents.content) {
		return null;
	}

	const content = fileWithContents.content;

	const nameMatch = content.match(/## Package:\s*(.+)/);
	if (!nameMatch) {
		console.warn(`package record ${file.filename}: missing name, skipped`);
		return null;
	}

	const canonicalNameMatch = content.match(/\*\*Canonical Name:\*\*\s*`([^`]+)`/);
	const pathMatch = content.match(/\*\*Path:\*\*\s*`([^`]+)`/);

	return {
		kind: 'package',
		name: nameMatch[1].trim(),
		canonicalName: canonicalNameMatch?.[1]?.trim() ?? '',
		path: pathMatch?.[1]?.trim() ?? '',
	};
}
