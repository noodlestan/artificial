import type { CheckoutRepositoryState } from '../../commands/repo/runRepo';

export function presentRepositoryState(state: CheckoutRepositoryState): void {
	console.info(`Repository: ${state.target.repo?.name || state.target.record.name}`);
	console.info(`Branch: ${state.branch || state.target.record.branch}`);
	if (state.issues.length > 0) console.info(`States: ${state.issues.join('; ')}`);
}
