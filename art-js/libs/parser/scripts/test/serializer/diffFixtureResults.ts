import * as fs from 'node:fs';
import * as path from 'node:path';

import { serialize } from '@art-js/artificial-serializer';

import { diffLines } from '../shared/diffLines';
import { readFileUtf8 } from '../shared/readFileUtf8';

export function diffFixtureResults(
	inputPath: string,
	snapshotPath: string,
	writeDebugResult: boolean,
): { hasDiff: boolean; diffCount: number } {
	const baseName = path.basename(inputPath);

	const artDocument = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
	const parsed = serialize(artDocument);
	const source = readFileUtf8(inputPath);
	const diffs = diffLines(source, parsed);

	if (diffs.length === 0) {
		console.info(`LOSSLESS ROUNDTRIP ${baseName}`);
		return { hasDiff: false, diffCount: 0 };
	}

	console.error(`ROUNDTRIP DIFF ${baseName}: ${diffs.length} line(s) differ`);
	for (const d of diffs) {
		console.error(
			`  L${d.line}: expected ${JSON.stringify(d.expected)} actual ${JSON.stringify(d.actual)}`,
		);
	}

	if (writeDebugResult) {
		const parsedPath = snapshotPath
			.replace('.art.json', '.parsed.md')
			.replace('.md.json', '.parsed.md');
		fs.writeFileSync(parsedPath, parsed, 'utf-8');
		console.info(`  wrote ${parsedPath}`);
	}

	return { hasDiff: true, diffCount: diffs.length };
}
