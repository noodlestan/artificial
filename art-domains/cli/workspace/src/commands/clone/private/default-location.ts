import { join } from 'node:path';

import type { RepositoryRecord } from '../../../config/types';

export function defaultLocation(repo: RepositoryRecord): string {
	return join('repos', repo.name.toLowerCase().replace(/\s+/g, '-'));
}
