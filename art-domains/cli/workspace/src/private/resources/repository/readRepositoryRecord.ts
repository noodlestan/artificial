import { readRecordFileContent } from '../../records/readRecordFileContent';
import type { RecordFile } from '../../records/types';
import type { RepositoryRecord } from '../types';

export async function readRepositoryRecord(file: RecordFile): Promise<RepositoryRecord | null> {
	const fileWithContents = file.content ? file : await readRecordFileContent(file);
	if (!fileWithContents.content) {
		return null;
	}

	const content = fileWithContents.content;

	const nameMatch = content.match(/## Repository:\s*(.+)/);
	if (!nameMatch) {
		return null;
	}

	const remoteMatch = content.match(/\*\*Remote:\*\*\s*`([^`]+)`/);
	const purposeMatch = content.match(/\*\*Purpose:\*\*\s*(.+)/);
	const descriptionMatch = content.match(/\*\*Description:\*\*\s*(.+)/);
	const consumersMatch = content.match(/\*\*Consumers:\*\*\s*(.+)/);

	if (!remoteMatch) {
		console.warn(`repository record ${file.filename}: missing remote, using default`);
	}

	return {
		name: nameMatch[1]?.trim() ?? '',
		remote: remoteMatch?.[1]?.trim() ?? '',
		...(purposeMatch ? { purpose: purposeMatch[1].trim() } : {}),
		...(descriptionMatch ? { description: descriptionMatch[1].trim() } : {}),
		...(consumersMatch ? { consumers: consumersMatch[1].trim() } : {}),
	};
}
