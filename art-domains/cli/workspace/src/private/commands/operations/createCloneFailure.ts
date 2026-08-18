import type { CloneFailure } from '../../operations/types';
import type { Checkout } from '../../store/createCheckout';

function formatRawError(raw: string): string {
	const lines = raw
		.split('\n')
		.map(l => l.trim())
		.filter(l => l.length > 0);
	return lines.map(l => '  ' + l).join('\n');
}

function extractReason(raw: string): string {
	const match = raw.match(/\(([^)]+)\)/);
	return match ? match[1] : (raw.split('\n')[0]?.trim() ?? 'unknown error');
}

export function createCloneFailure(checkout?: Checkout, e?: unknown): CloneFailure {
	const rawError = e instanceof Error ? e.message : String(e);

	const location = checkout?.record.location || 'unknown';
	const repoName = checkout?.repo?.name || 'unknmown';

	return {
		ts: new Date(),
		checkout,
		outcome: 'failure',
		operation: 'clone',
		location: checkout?.record.location || 'unknown',
		error: rawError,
		message() {
			return `clone failed on ${repoName}: ${extractReason(this.error)}`;
		},
		errorSerialized() {
			return `CloneError: ${repoName} at ${location} — ${this.message()}\n\n${formatRawError(this.error)}`;
		},
	};
}
