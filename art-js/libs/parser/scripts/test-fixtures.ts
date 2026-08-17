import * as fs from 'node:fs';
import * as path from 'node:path';

import { parse } from '../src/index'; // parser entry point — parse stub returns undefined until phase 3

const FIXTURES_DIR = path.join(
	path.dirname(new URL(import.meta.url).pathname),
	'..',
	'test',
	'fixtures',
);

function getFixtures(): string[] {
	const files = fs.readdirSync(FIXTURES_DIR);
	return files
		.filter(f => f.endsWith('.md') || f.endsWith('.art'))
		.filter(f => !f.endsWith('.art.json'))
		.sort();
}

function getTimeMs(): number {
	return Date.now();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseFixture(filePath: string): {
	success: boolean;
	document?: unknown;
	error?: string;
	durationMs: number;
} {
	const startTime = getTimeMs();

	try {
		const content = fs.readFileSync(filePath, 'utf-8');
		const document = parse(content);
		const endTime = getTimeMs();
		return { success: true, document, durationMs: endTime - startTime };
	} catch (error) {
		const endTime = getTimeMs();
		return { success: false, error: (error as Error).message, durationMs: endTime - startTime };
	}
}

async function main(): Promise<void> {
	const fixtures = getFixtures();
	let exitCode = 0;
	let totalParseTime = 0;
	const startTime = getTimeMs();

	console.info(`Testing ${fixtures.length} fixtures...\n`);

	for (const fixture of fixtures) {
		const filePath = path.join(FIXTURES_DIR, fixture);
		const result = parseFixture(filePath);
		totalParseTime += result.durationMs;

		const status = result.success ? 'PASS' : 'FAIL';
		console.info(`${fixture.padEnd(30)} ${status} (${result.durationMs}ms)`);

		// Save parsed document as JSON next to the fixture, normalising the extension to ".art.json"
		if (result.document !== undefined) {
			try {
				const parsedPath = path.parse(filePath);
				// parsedPath.name is the file name without extension (e.g. "section-block")
				const outPath = path.join(parsedPath.dir, parsedPath.name + '.art.json');
				fs.writeFileSync(outPath, JSON.stringify(result.document, null, 2) + '\n', 'utf-8');
			} catch (err) {
				console.error(`  Failed to write JSON output: ${(err as Error).message}`);
			}
		}

		if (!result.success) {
			console.error(`  Error: ${result.error}`);
			exitCode = 1;
		}
	}

	const endTime = getTimeMs();
	const totalTime = endTime - startTime;

	console.info('\n' + '='.repeat(50));
	console.info(`Results: ${fixtures.length} fixtures tested`);
	console.info(`Total time: ${totalTime}ms`);
	console.info(`Parse time: ${totalParseTime}ms`);
	console.info(`Overhead: ${totalTime - totalParseTime}ms`);
	console.info('='.repeat(50));

	if (exitCode === 0) {
		console.info('\nAll fixtures passed!');
	} else {
		console.info('\nSome fixtures failed!');
	}

	process.exit(exitCode);
}

main();
