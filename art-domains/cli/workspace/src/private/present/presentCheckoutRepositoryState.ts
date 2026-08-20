import type { CheckoutRepositoryState } from '../../commands/repo/runRepo';

export function presentCheckoutRepositoryState(state: CheckoutRepositoryState): void {
	console.info(`Repository:`);
	console.info(`  name: ${state.target.repo?.name || '(unknown)'}`);
	console.info(`  name: ${state.target.repo?.remote || '(unknown)'}`);
	if (state.issues.length > 0) {
		console.info(`  issues: ${state.issues.join('; ')}`);
	}
	console.info('');

	console.info(`Checkout:`);
	console.info(`  record: ${state.target.filename || '(unknown)'}`);
	console.info(`  location: ${state.target.record.location || '(unknown)'}`);
	console.info(`  branch: ${state.branch || state.target.record.branch}`);
	if (state.target.scan && state.target.scan.issues().length > 0) {
		console.info(`  states: ${state.target.scan.issues().join('; ')}`);
	}
	console.info('');
}
