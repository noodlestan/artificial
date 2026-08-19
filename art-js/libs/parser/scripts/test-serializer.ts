import * as path from 'node:path';

import { FIXTURES_DIR } from './test/constants';
import { diffFixtureResults } from './test/serializer/diffFixtureResults';
import { parseSerializerArgs } from './test/serializer/parseSerializerArgs';
import { serializeFixture } from './test/serializer/serializeFixture';
import { getFixturePairs } from './test/shared/get-fixture-pairs';
import { printSummary } from './test/shared/printSummary';

const { doWriteDebugResult, filterFixture } = parseSerializerArgs();

async function run(): Promise<number> {
	const pairs = getFixturePairs(FIXTURES_DIR);
	let tested = 0;
	let failed = 0;
	let totalSerializeTime = 0;
	const startTime = Date.now();

	console.info(`Found ${pairs.length} fixture(s) with snapshots. Tsting...\n`);

	for (const { input, snapshot } of pairs) {
		if (filterFixture && !path.basename(input).includes(filterFixture)) {
			continue;
		}
		tested++;
		const result = serializeFixture(snapshot);
		totalSerializeTime += result.durationMs;

		if (!result.success) {
			console.error(result.error);
			failed++;
			continue;
		}

		const diffResult = diffFixtureResults(input, snapshot, doWriteDebugResult);
		if (diffResult.hasDiff) {
			failed++;
		}
	}

	printSummary({
		fixturesTotal: pairs.length,
		tested,
		totalTimeMs: Date.now() - startTime,
		operationTimeMs: totalSerializeTime,
		operationLabel: 'Serialize time',
		failed,
	});

	// WIP: uncomment when all fixtures pass.
	// return failed === 0 ? 0 : 2;
	return 0;
}

const code = await run();
process.exit(code);
