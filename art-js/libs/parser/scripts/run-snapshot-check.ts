/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { parse } from '@art-js/artificial-parser';
import { serialize } from '@art-js/artificial-serializer';

const THIS_DIR = path.dirname(new URL(import.meta.url).pathname);

const LOCAL_FIXTURES_DIR = path.resolve(THIS_DIR, '..', 'test', 'fixtures');

function validateFixturesDir() {
	if (fs.existsSync(LOCAL_FIXTURES_DIR)) return LOCAL_FIXTURES_DIR;
	throw new Error(`No fixtures directory found. Checked:\n - ${LOCAL_FIXTURES_DIR}\n`);
}

function readSnapshot(snapshotPath: string) {
	return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}

function writeSnapshot(snapshotPath: string, art: unknown) {
	return fs.writeFileSync(snapshotPath, JSON.stringify(art, null, 2) + '\n', 'utf-8');
}

function normalise(obj: unknown): unknown {
	// Basic normalisation: remove undefined properties and ensure stable ordering for deterministic JSON
	if (obj === null || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map(normalise);

	const entries = Object.entries(obj as Record<string, unknown>)
		.filter(([, v]) => v !== undefined)
		.sort(([a], [b]) => a.localeCompare(b));
	const out: Record<string, unknown> = {};
	for (const [k, v] of entries) out[k] = normalise(v);
	return out;
}

function jsonEq(a: unknown, b: unknown): boolean {
	try {
		const na = JSON.stringify(normalise(a));
		const nb = JSON.stringify(normalise(b));
		return na === nb;
	} catch (err) {
		return false;
	}
}

function fixturePairs(fixturesDir: string): Array<{ input: string; snapshot: string }> {
	const files = fs.readdirSync(fixturesDir).sort();
	const inputs = files.filter(f => f.endsWith('.md') || f.endsWith('.art'));
	const pairs: Array<{ input: string; snapshot: string }> = [];

	for (const input of inputs) {
		const snapshotName = input + '.json';
		const snapshotPath = path.join(fixturesDir, snapshotName);
		const inputPath = path.join(fixturesDir, input);
		if (fs.existsSync(snapshotPath)) {
			pairs.push({ input: inputPath, snapshot: snapshotPath });
		} else {
			console.warn(`Skipping ${input} - no snapshot found (${snapshotName})`);
		}
	}

	return pairs;
}

function readFileUtf8(p: string) {
	return fs.readFileSync(p, 'utf-8');
}

function diffLines(
	a: string,
	b: string,
): Array<{ line: number; expected: string; actual: string }> {
	const aLines = a.split('\n');
	const bLines = b.split('\n');
	const diffs: Array<{ line: number; expected: string; actual: string }> = [];
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

function run(): number {
	const fixturesDir = validateFixturesDir();
	console.info(`Using fixtures directory: ${fixturesDir}`);

	const pairs = fixturePairs(fixturesDir);
	console.info(`Found ${pairs.length} fixture(s) with snapshots.`);

	let failed = 0;
	for (const { input, snapshot } of pairs) {
		const inputText = readFileUtf8(input);
		let art: unknown;
		try {
			// parse may throw
			art = (parse as any)(inputText);
		} catch (err) {
			console.error(`FAIL ${path.basename(input)} — parser threw: ${(err as Error).message}`);
			failed += 1;
			continue;
		}

		let expected: unknown;
		try {
			expected = readSnapshot(snapshot);
		} catch (err) {
			console.error(
				`FAIL ${path.basename(input)} — cannot read snapshot: ${(err as Error).message}`,
			);
			failed += 1;
			continue;
		}

		if (!jsonEq(art, expected)) {
			console.error(`MISMATCH ${path.basename(input)} -> ${path.basename(snapshot)}`);
			if (process.argv.includes('--write')) {
				writeSnapshot(snapshot, art);
			}
			failed += 1;
		} else {
			console.info(`PASS ${path.basename(input)} -> ${path.basename(snapshot)}`);
		}
	}

	// --- return direction: art.json → parsed.md ---
	let roundtripOverhead = 0;
	for (const { input, snapshot } of pairs) {
		const baseName = path.basename(input);
		let artDocument: unknown;
		try {
			artDocument = readSnapshot(snapshot);
		} catch (err) {
			console.error(`ROUNDTRIP FAIL ${baseName} — cannot read snapshot: ${(err as Error).message}`);
			failed += 1;
			continue;
		}

		let parsed: string;
		try {
			parsed = serialize(artDocument as any);
		} catch (err) {
			console.error(`ROUNDTRIP FAIL ${baseName} — serializer threw: ${(err as Error).message}`);
			failed += 1;
			continue;
		}

		if (!parsed || parsed.length === 0) {
			console.error(`ROUNDTRIP FAIL ${baseName} — serializer returned empty output`);
			failed += 1;
			continue;
		}

		const source = readFileUtf8(input);
		const diffs = diffLines(source, parsed);
		if (diffs.length === 0) {
			console.info(`LOSSLESS ROUNDTRIP ${baseName}`);
		} else {
			roundtripOverhead += diffs.length;
			console.warn(`ROUNDTRIP DIFF ${baseName}: ${diffs.length} line(s) differ`);
			for (const d of diffs) {
				console.warn(
					`  L${d.line}: expected ${JSON.stringify(d.expected)} actual ${JSON.stringify(d.actual)}`,
				);
			}
		}

		if (process.argv.includes('--write')) {
			const parsedPath = snapshot
				.replace('.art.json', '.parsed.md')
				.replace('.md.json', '.parsed.md');
			fs.writeFileSync(parsedPath, parsed, 'utf-8');
			console.info(`  wrote ${parsedPath}`);
		}
	}

	if (roundtripOverhead > 0) {
		console.warn(`\nRoundtrip overhead: ${roundtripOverhead} total line(s) differ across fixtures`);
	} else {
		console.info('\nAll roundtrips lossless');
	}

	if (failed === 0) {
		console.info('\nAll snapshot checks passed');
	} else {
		console.error(`\n${failed} snapshot check(s) failed`);
	}

	return failed === 0 ? 0 : 2;
}

const code = run();
process.exit(code);
