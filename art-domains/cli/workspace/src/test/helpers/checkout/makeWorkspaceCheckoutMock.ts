import {
	createCheckoutScan,
	createCommittedState,
	createExistsState,
	createNoConflictsState,
	createNoDetachedState,
	createRemoteState,
	createRepoState,
	createSyncState,
} from '../../../private/scan/types';
import type { Checkout } from '../../../private/store/createCheckout';

export function makeWorkspaceCheckoutMock(path: string, overrides?: Partial<Checkout>): Checkout {
	return {
		repo: undefined,
		record: { name: 'Workspace', location: '.', branch: 'main', repository: undefined },
		path,
		scan: createCheckoutScan([
			createRepoState(false),
			createExistsState(true),
			createRemoteState('main', 'main', true),
			createSyncState(0),
			createCommittedState(true),
			createNoConflictsState(true),
			createNoDetachedState(true),
		]),
		...overrides,
	};
}
