import type { WorkspaceContext } from '../context/createWorkspaceContext';
import { RepositoryCheckoutRecord } from '../records/types';

import { createCheckout } from './create-checkout';

export function hydrateStoreFromRecords(
	ctx: WorkspaceContext,
	records: RepositoryCheckoutRecord[],
): void {
	for (const record of records) {
		const checkout = createCheckout(
			ctx.config,
			record.checkout.location,
			record.repo,
			record.checkout.branch,
			record.checkout.name,
		);
		ctx.store.addCheckout(checkout);
	}
}
