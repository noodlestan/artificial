import * as fs from 'node:fs';
import * as path from 'node:path';

export interface FixturePair {
	input: string;
	snapshot?: string;
}

export function getFixturePairs(fixturesDir: string): FixturePair[] {
	const files = fs.readdirSync(fixturesDir).sort();
	const inputs = files.filter(f => f.endsWith('.md') || f.endsWith('.art'));
	const pairs: FixturePair[] = [];

	for (const input of inputs) {
		const snapshotName = input + '.json';
		const snapshotPath = path.join(fixturesDir, snapshotName);
		const inputPath = path.join(fixturesDir, input);
		if (fs.existsSync(snapshotPath)) {
			pairs.push({ input: inputPath, snapshot: snapshotPath });
		} else {
			pairs.push({ input: inputPath });
			console.warn(`Skipping ${input} - no snapshot found (${snapshotName})`);
		}
	}

	return pairs;
}
