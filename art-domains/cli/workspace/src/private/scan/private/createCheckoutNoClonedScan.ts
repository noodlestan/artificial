import { createCommittedState } from '../states/createCommittedState';
import { createExistsState } from '../states/createExistsState';
import { createNoConflictsState } from '../states/createNoConflictsState';
import { createNoDetachedState } from '../states/createNoDetachedState';
import { createRemoteState } from '../states/createRemoteState';
import { createRepoState } from '../states/createRepoState';
import { createSyncState } from '../states/createSyncState';
import type { CheckoutScan } from '../types';

import { createCheckoutScan } from './createCheckoutScan';

export function createCheckoutNoClonedScan(known: boolean): CheckoutScan {
	return createCheckoutScan([
		createRepoState(known),
		createExistsState(false),
		createRemoteState(null, '', false),
		createSyncState(0),
		createCommittedState(true),
		createNoConflictsState(true),
		createNoDetachedState(true),
	]);
}
