import simpleGit from 'simple-git';

import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';
import { createPullFailure } from '../../../private/operations/createPullFailure';
import { createPullSuccess } from '../../../private/operations/createPullSuccess';
import { isCleanCheckout } from '../../../private/scan/isCleanCheckout';
import type { Checkout } from '../../../private/store/createCheckout';

export async function pullWorkspaceCheckout(ctx: WorkspaceContext): Promise<void> {
	const workspace = ctx.workspace;
	if (!workspace) return;
	if (!isCleanCheckout(workspace)) return;
	if (!workspace.scan?.isBehind) return;

	const git = simpleGit(workspace.path);
	try {
		await git.pull('origin', workspace.record.branch);
		const updated: Checkout = {
			...workspace,
			scan: workspace.scan && {
				...workspace.scan,
				isBehind: false,
				issues: workspace.scan.issues.filter(i => !/\d+ commit behind/.test(i)),
			},
		};
		ctx.workspace = updated;
		ctx.log.log(createPullSuccess(workspace, workspace.record.branch));
	} catch (error) {
		const op = createPullFailure(workspace, workspace.record.branch, error);
		const updated: Checkout = {
			...workspace,
			scan: workspace.scan && {
				...workspace.scan,
				issues: [...workspace.scan.issues, op.message()],
			},
		};
		ctx.workspace = updated;
		ctx.log.log(op);
	}
}
