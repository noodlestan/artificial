import { RepositoryRecord } from '../records/types';

import { safePath } from './safe-path';

export function createCheckoutLocation(repo: RepositoryRecord, target?: string): string {
	return safePath(target ? repo.name + ' ' + target : repo.name);
}
