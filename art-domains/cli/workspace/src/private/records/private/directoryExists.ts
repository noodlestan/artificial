import { existsSync, statSync } from 'node:fs';

export function directoryExists(path: string): boolean {
	if (!existsSync(path)) {
		return false;
	}

	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}
