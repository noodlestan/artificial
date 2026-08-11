import type { Operation } from '../private/operations/types';

export interface OperationsLog {
	log(operation: Operation): void;
	all(): Operation[];
	since(ts: Date): Operation[];
	latest(n: number): Operation[];
}

export function createOperationsLog(): OperationsLog {
	const operations: Operation[] = [];

	return {
		log(operation: Operation): void {
			operations.push(operation);
		},

		all(): Operation[] {
			return [...operations];
		},

		since(ts: Date): Operation[] {
			return operations.filter(op => op.ts > ts);
		},

		latest(n: number): Operation[] {
			return operations.slice(-n);
		},
	};
}
