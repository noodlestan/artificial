import { readRecordFileContent } from '../readRecordFileContent';
import type { RecordFile } from '../types';

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function filterFilenamesByKinds(
	files: RecordFile[],
	kinds: string[],
): Promise<RecordFile[]> {
	if (kinds.length === 0) {
		return files;
	}

	const matchingFiles = await Promise.all(
		files.map(async file => {
			const fileWithContents = file.content ? file : await readRecordFileContent(file);
			if (!fileWithContents.content) {
				return null;
			}

			return kinds.some(kind =>
				new RegExp(`^##\\s+${escapeRegExp(kind)}\\s*:`, 'm').test(
					fileWithContents.content as string,
				),
			)
				? fileWithContents
				: null;
		}),
	);

	return matchingFiles.filter((file): file is RecordFile => file !== null);
}
