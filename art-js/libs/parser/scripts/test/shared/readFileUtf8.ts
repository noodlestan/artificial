import * as fs from 'node:fs';

export function readFileUtf8(p: string): string {
	return fs.readFileSync(p, 'utf-8');
}
