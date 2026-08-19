export interface DiffEntry {
	line: number;
	expected: string;
	actual: string;
}

export function diffLines(a: string, b: string): DiffEntry[] {
	const aLines = a.split('\n');
	const bLines = b.split('\n');
	const diffs: DiffEntry[] = [];
	const maxLen = Math.max(aLines.length, bLines.length);
	for (let i = 0; i < maxLen; i++) {
		const al = aLines[i] ?? '';
		const bl = bLines[i] ?? '';
		if (al !== bl) {
			diffs.push({ line: i + 1, expected: al, actual: bl });
		}
	}
	return diffs;
}
