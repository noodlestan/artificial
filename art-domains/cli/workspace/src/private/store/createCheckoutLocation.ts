import { RepositoryRecord } from '../records/types';

import { safePath } from './safePath';

export function createCheckoutLocation(repo: RepositoryRecord, target?: string): string {
	return safePath(target ? repo.name + ' ' + target : repo.name);
}
