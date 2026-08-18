import {
	CheckoutScan,
	createCheckoutScan,
	createCommittedState,
	createExistsState,
	createNoConflictsState,
	createNoDetachedState,
	createRemoteState,
	createRepoState,
	createSyncState,
} from '../../../private/scan/types';

export function makeMockScan(behind: number, dirty = false): CheckoutScan {
	return createCheckoutScan([
		createRepoState(false),
		createExistsState(true),
		createRemoteState('main', 'main', true),
		createSyncState(-behind, 0, behind),
		createCommittedState(!dirty),
		createNoConflictsState(true),
		createNoDetachedState(true),
	]);
}
