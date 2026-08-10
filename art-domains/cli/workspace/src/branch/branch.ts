import { loadWorkspaceConfig } from '../config/load-config';
import { createCheckoutStore } from '../shared/checkout-store';
import { createOperationsLog } from '../shared/operations-log';
import { createWorkspaceContext } from '../shared/workspace-context';

interface BranchOptions {
	root: string;
}

export async function runBranch(_options: BranchOptions): Promise<void> {
	// TODO: implement branch command
	console.info('branch command - TODO');
}
