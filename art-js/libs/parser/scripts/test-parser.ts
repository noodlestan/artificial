import * as fs from 'node:fs';
import * as path from 'node:path';

import { FIXTURES_DIR } from './test/constants';
import { parseFixture } from './test/parser/parseFixture';
import { parseParserArgs } from './test/parser/parseParserArgs';
import type { ParseResult } from './test/parser/types';
import { getFixturePairs } from './test/shared/get-fixture-pairs';
import { printSummary } from './test/shared/printSummary';
import { stableStringify } from './test/shared/stableStringify';

const { doWrite, doWriteDebug, filterFixture } = parseParserArgs();

function reportFixture(input: string, result: ParseResult, error?: string) {
	const fixture = path.basename(input);
	const status = result.success && !error ? 'PASS' : 'FAIL';
	const duration = `${String(result.durationMs)}ms`;
	console.info(`${status} ${duration.padEnd(5)} ${fixture}`);
	if (error) {
		console.error(`  ERROR in fixture "${fixture}": ${error}`);
		console.info('');
	}
}

async function run(): Promise<number> {
	const pairs = getFixturePairs(FIXTURES_DIR);
	let tested = 0;
	let failed = 0;
	let totalParseTime = 0;
	const startTime = Date.now();

	console.info(`Found ${pairs.length} fixture(s) with snapshots. Testing...\n`);

	for (const { input } of pairs) {
		if (filterFixture && !path.basename(input).includes(filterFixture)) {
			continue;
		}
		tested++;
		const result = parseFixture(input);
		totalParseTime += result.durationMs;

		if (doWrite && result.success) {
			const outPath = input + '.json';
			fs.writeFileSync(outPath, stableStringify(result.document) + '\n', 'utf-8');
		}
		if (doWriteDebug) {
			const outPath = input + '.debug.json';
			fs.writeFileSync(outPath, stableStringify(result.document) + '\n', 'utf-8');
		}

		if (!result.success) {
			reportFixture(input, result, result.error);
			failed++;
			continue;
		}

		const snapshotPath = input + '.json';
		if (!fs.existsSync(snapshotPath)) {
			const error = `No snapshot for ${path.basename(input)}. Use --write to create one.`;
			reportFixture(input, result, error);
			failed++;
			continue;
		}

		const expected = fs.readFileSync(snapshotPath, 'utf-8');
		const actual = stableStringify(result.document) + '\n';
		if (expected !== actual) {
			reportFixture(input, result, 'MISMATCH');
			failed++;
			continue;
		}

		reportFixture(input, result);
	}

	printSummary({
		fixturesTotal: pairs.length,
		tested,
		totalTimeMs: Date.now() - startTime,
		operationTimeMs: totalParseTime,
		operationLabel: 'Parse time',
		failed,
	});

	return failed === 0 ? 0 : 2;
}

const code = await run();
process.exit(code);
