import { rmSync } from 'node:fs';

export function removeTempDirs(tempDirs: string[]): void {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
}
