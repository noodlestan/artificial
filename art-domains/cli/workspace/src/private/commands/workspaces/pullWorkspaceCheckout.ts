import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../context/createWorkspaceContext';
import { scanCheckoutState } from '../../scan/scanCheckoutState';
import type { Checkout } from '../../store/createCheckout';
import { createPullFailure } from '../operations/createPullFailure';
import { createPullSuccess } from '../operations/createPullSuccess';

export async function pullWorkspaceCheckout(ctx: WorkspaceContext): Promise<Checkout | null> {
	const workspace = ctx.workspace;
	if (!workspace) return null;
	if (!workspace.scan?.can?.('pull') || !workspace.scan.should?.('pull')) return null;

	const git = simpleGit(workspace.path);
	try {
		await git.pull('origin', workspace.record.branch);
		const updated = await scanCheckoutState(workspace);
		ctx.workspace = updated;
		ctx.log.log(createPullSuccess(workspace, workspace.record.branch));
		return updated;
	} catch (error) {
		const op = createPullFailure(workspace, workspace.record.branch, error);
		ctx.log.log(op);
		return null;
	}
}
