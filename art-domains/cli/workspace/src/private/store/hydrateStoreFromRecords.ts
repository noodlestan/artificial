import type { WorkspaceConfig } from '../../config/types';
import { RepositoryCheckoutRecord } from '../resources/types';

import { createCheckout } from './createCheckout';
import type { CheckoutStore } from './createCheckoutStore';

export function hydrateStoreFromRecords(
	config: WorkspaceConfig,
	store: CheckoutStore,
	records: RepositoryCheckoutRecord[],
): void {
	for (const record of records) {
		const checkout = createCheckout(
			config,
			record.checkout.location,
			record.repo,
			record.checkout.branch,
			record.checkout.name,
		);
		store.addCheckout({ ...checkout, filename: record.filename });
	}
}
