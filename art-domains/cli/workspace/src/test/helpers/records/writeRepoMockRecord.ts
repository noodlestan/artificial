import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeRepoMockRecord(tempDir: string, name: string, remote: string): void {
	const dir = join(tempDir, 'ops/records/repositories');
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Repository: ' +
			name +
			'\n\n**Purpose:** test\n\n**Remote:** `' +
			remote +
			'`\n',
	);
}
