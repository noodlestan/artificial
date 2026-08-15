import type { Checkout } from '../store/createCheckout';

import type { PullFailure } from './types';

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

function toMessage(raw: string): string {
	return extractReason(raw);
}

export function createPullFailure(checkout: Checkout, branch: string, error: unknown): PullFailure {
	const rawError = error instanceof Error ? error.message : String(error);

	return {
		ts: new Date(),
		checkout,
		outcome: 'failure',
		operation: 'pull',
		branch,
		error: rawError,
		message() {
			return toMessage(this.error);
		},
		errorSerialized() {
			return `PullError: ${checkout.repo?.name} on ${branch} — ${this.message()}\n\n${formatRawError(this.error)}`;
		},
	};
}
