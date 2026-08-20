import { readRecordFileContent } from '../../records/readRecordFileContent';
import type { RecordFile } from '../../records/types';
import type { CheckoutRecord } from '../types';

export async function readCheckoutRecord(file: RecordFile): Promise<CheckoutRecord | null> {
	const fileWithContents = file.content ? file : await readRecordFileContent(file);
	if (!fileWithContents.content) {
		return null;
	}

	const content = fileWithContents.content;

	const nameMatch = content.match(/## Checkout:\s*(.+)/);
	if (!nameMatch) {
		return null;
	}

	const repositoryMatch = content.match(/\*\*Repository:\*\*\s*(.+)/);
	const locationMatch = content.match(/\*\*Location:\*\*\s*`([^`]+)`/);
	const branchMatch = content.match(/\*\*Branch:\*\*\s*`([^`]+)`/);

	if (!locationMatch) {
		console.warn(`checkout record ${file.filename}: missing location, using default`);
	}
	if (!branchMatch) {
		console.warn(`checkout record ${file.filename}: missing branch, using default`);
	}

	return {
		name: nameMatch[1]?.trim() ?? '',
		repository: repositoryMatch?.[1]?.trim(),
		location: locationMatch?.[1]?.trim() ?? '',
		branch: branchMatch?.[1]?.trim() ?? 'main',
	};
}
