import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeCheckoutMockRecord(
	tempDir: string,
	repository: string,
	name: string,
	location: string,
	branch = 'main',
): void {
	const dir = join(tempDir, '_records');
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Checkout: ' +
			name +
			'\n\n**Repository:** ' +
			repository +
			'\n\n**Location:** `' +
			location +
			'`\n\n**Branch:** `' +
			branch +
			'`\n',
	);
}
