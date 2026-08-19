import * as fs from 'node:fs';

import { parse } from '../../../src/index';

import type { ParseResult } from './types';

export function parseFixture(filePath: string): ParseResult {
	let content: string;
	try {
		content = fs.readFileSync(filePath, 'utf-8');
	} catch (error) {
		return {
			success: false,
			error: (error as Error).message,
			durationMs: 0,
		};
	}

	const startTime = Date.now();
	try {
		const document = parse(content);
		const durationMs = Date.now() - startTime;
		return { success: true, document, durationMs };
	} catch (error) {
		const durationMs = Date.now() - startTime;
		return {
			success: false,
			error: (error as Error).message,
			durationMs,
		};
	}
}
