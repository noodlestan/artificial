import type { Checkout } from '../../shared/checkout';

import type { BranchFailure } from './types';

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

export function createBranchFailure(
	checkout: Checkout,
	branch: string,
	error: unknown,
): BranchFailure {
	const rawError = error instanceof Error ? error.message : String(error);

	return {
		ts: new Date(),
		checkout,
		outcome: 'failure',
		operation: 'branch created',
		branch,
		error: rawError,
		message() {
			return extractReason(this.error);
		},
		errorSerialized() {
			return `BranchError: ${checkout.repo.name} on ${branch} — ${this.message()}\n\n${formatRawError(this.error)}`;
		},
	};
}
