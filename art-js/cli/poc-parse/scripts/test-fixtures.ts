/**
 * Test script for poc-parse fixtures
 * Uses the parse API directly for fast fixture testing
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { parse } from '../src/parse/parse';

const FIXTURES_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'fixtures');

// Get all .md and .art files in fixtures directory, excluding .art.json files
function getFixtures(): string[] {
	const files = fs.readdirSync(FIXTURES_DIR);
	return files
		.filter(f => f.endsWith('.md') || f.endsWith('.art'))
		.filter(f => !f.endsWith('.art.json'))
		.sort();
}

// Get current time in milliseconds
function getTimeMs(): number {
	return Date.now();
}

// Parse a fixture file and return the result
function parseFixture(filePath: string): {
	success: boolean;
	document?: unknown;
	error?: string;
	durationMs: number;
} {
	const startTime = getTimeMs();

	try {
		// Read the file content
		const content = fs.readFileSync(filePath, 'utf-8');

		// Parse using the API
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
