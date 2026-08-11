import type { Checkout } from '../../shared/checkout';

import type { CloneFailure } from './types';

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

export function createCloneFailure(checkout: Checkout, e: unknown): CloneFailure {
	const rawError = e instanceof Error ? e.message : String(e);

	return {
		ts: new Date(),
		checkout,
		outcome: 'failure',
		operation: 'clone',
		location: checkout.record.location,
		error: rawError,
		message() {
			return `clone failed on ${checkout.repo.name}: ${extractReason(this.error)}`;
		},
		errorSerialized() {
			return `CloneError: ${checkout.repo.name} at ${checkout.record.location} — ${this.message()}\n\n${formatRawError(this.error)}`;
		},
	};
}
