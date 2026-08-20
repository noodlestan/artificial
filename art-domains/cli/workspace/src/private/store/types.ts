import type { CheckoutRecord, RepositoryRecord } from '../resources/types';
import type { CheckoutScan } from '../scan/types';

export interface Checkout {
	repo?: RepositoryRecord;
	record: CheckoutRecord;
	filename?: string;
	path: string;
	scan?: CheckoutScan;
}
