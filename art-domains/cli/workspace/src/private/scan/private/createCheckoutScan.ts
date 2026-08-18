import type { CheckoutOp } from '../../operations/types';
import type { CheckoutScan, CheckoutState } from '../types';

import { createStateAccessor } from './createStateAccessor';

export function createCheckoutScan(states: CheckoutState[]): CheckoutScan {
	const state = createStateAccessor(states);

	const issues = (): string[] => {
		const result: string[] = [];
		const repo = state('repo');
		const exists = state('exists');
		const remote = state('remote');
		const sync = state('sync');
		if (!repo.known) result.push('unknown project');
		if (!exists.exists) return [...result, 'not cloned'];
		if (!state('no-detached').attached) result.push('detached HEAD');
		if (remote.branch !== remote.expectedBranch && state('no-detached').attached) {
			result.push('wrong branch');
		}
		if (!state('no-conflicts').clear) result.push('merge conflicts');
		if (!remote.hasRemote) result.push('no remote');
		if (!state('committed').clean) result.push('uncommitted files');
		if (sync.ahead > 0) result.push(`${sync.ahead} commit${sync.ahead === 1 ? '' : 's'} ahead`);
		if (sync.behind > 0) {
			const count = sync.behind;
			result.push(`${count} commit${count === 1 ? '' : 's'} behind`);
		}
		return result;
	};

	return {
		states,
		state,
		issues,
		can: (op: CheckoutOp) => {
			if (op === 'clone') return !state('exists').exists;
			if (op === 'branch') return state('exists').exists && state('no-detached').attached;
			const exists = state('exists');
			const remote = state('remote');
			return (
				exists.exists &&
				remote.branch === remote.expectedBranch &&
				state('committed').clean &&
				state('no-conflicts').clear &&
				state('no-detached').attached &&
				remote.hasRemote
			);
		},
		should: (op: CheckoutOp) => {
			if (op === 'clone') return !state('exists').exists;
			if (op === 'pull') return state('sync').behind > 0;
			if (op === 'push') return state('sync').ahead > 0;
			return false;
		},
	};
}
