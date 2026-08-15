import type { Checkout } from '../store/createCheckout';

export type OperationOutcome = 'success' | 'failure';

export interface OperationBase {
	operation: string;
	ts: Date;
	checkout?: Checkout;
	outcome: OperationOutcome;
	message: () => string;
}

export interface OperationSuccess extends OperationBase {
	outcome: 'success';
}

export interface OperationFailure extends OperationBase {
	outcome: 'failure';
	error: string;
	errorSerialized: () => string;
}

export interface CloneSuccess extends OperationSuccess {
	operation: 'clone';
	location: string;
}

export interface PushSuccess extends OperationSuccess {
	operation: 'push';
	branch: string;
}

export interface PullSuccess extends OperationSuccess {
	operation: 'pull';
	branch: string;
}

export interface PublishSuccess extends OperationSuccess {
	operation: 'publish';
	package: string;
	version: string;
}

export interface BranchSuccess extends OperationSuccess {
	operation: 'branch created';
	branch: string;
}

export interface LinkedSuccess extends OperationSuccess {
	operation: 'linked';
	package: string;
	target: string;
}

export interface UnlinkSuccess extends OperationSuccess {
	operation: 'unlink';
	package: string;
	source: string;
}

export interface PushFailure extends OperationFailure {
	operation: 'push';
	branch: string;
}

export interface PullFailure extends OperationFailure {
	operation: 'pull';
	branch: string;
}

export interface PublishFailure extends OperationFailure {
	operation: 'publish';
	package: string;
	version: string;
}

export interface BranchFailure extends OperationFailure {
	operation: 'branch created';
	branch: string;
}

export interface LinkedFailure extends OperationFailure {
	operation: 'linked';
	package: string;
	target: string;
}

export interface UnlinkFailure extends OperationFailure {
	operation: 'unlink';
	package: string;
	source: string;
}

export interface CloneFailure extends OperationFailure {
	operation: 'clone';
	location: string;
}

export type Operation =
	| CloneSuccess
	| CloneFailure
	| PushSuccess
	| PushFailure
	| PullSuccess
	| PullFailure
	| PublishSuccess
	| PublishFailure
	| BranchSuccess
	| BranchFailure
	| LinkedSuccess
	| LinkedFailure
	| UnlinkSuccess
	| UnlinkFailure;
