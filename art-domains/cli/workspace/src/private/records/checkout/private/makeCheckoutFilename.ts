import { join } from 'node:path';

import type { WorkspaceConfig } from '../../../../config/types';
import type { CheckoutRecord } from '../../types';

export function makeCheckoutFilename(config: WorkspaceConfig, data: CheckoutRecord): string {
	const slug = data.name.toLowerCase().replace(/\s+/g, '-');
	return join(config.root.path, config.checkouts.path, `${slug}.art`);
}
