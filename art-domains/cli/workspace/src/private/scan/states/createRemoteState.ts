import type { CheckoutStateRemote } from '../types';

export const createRemoteState = (
	branch: string | null,
	expectedBranch: string,
	hasRemote: boolean,
): CheckoutStateRemote => ({ type: 'remote', branch, expectedBranch, hasRemote });
