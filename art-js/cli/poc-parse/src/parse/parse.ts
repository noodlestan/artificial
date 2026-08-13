/* eslint-disable no-console */
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildDocument } from './builder';
import type { Document } from './types';

import { createDefaultConfig } from './index';

export function parse(markdown: string): Document {
	const config = createDefaultConfig();
	return buildDocument(markdown, config);
}

const REPO_ROOT = resolve(import.meta.dirname, '../../../../../../..');

function resolveInputPath(filePath: string): string {
	if (isAbsolute(filePath)) return filePath;
	const fromCwd = resolve(process.cwd(), filePath);
	if (existsSync(fromCwd)) return fromCwd;
	return resolve(REPO_ROOT, filePath);
}

function runCli(): void {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error('usage: npx tsx src/parse/parse.ts <file.art>');
		process.exit(1);
	}
	const markdown = readFileSync(resolveInputPath(filePath), 'utf8');
	const document = parse(markdown);
	console.log(JSON.stringify(document, null, 2));
}

const isDirectRun =
	process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
	runCli();
}
