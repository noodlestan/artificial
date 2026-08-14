import type { WorkspaceContext } from '../context/createWorkspaceContext';
import { getCurrentBranch } from '../git/getCurrentBranch';
import { getRemoteBranch } from '../git/getRemoteBranch';
import { getUnpushedCount } from '../git/getUnpushedCount';
import { hasMergeConflicts } from '../git/hasMergeConflicts';
import { hasRemote } from '../git/hasRemote';
import { isDetachedHead } from '../git/isDetachedHead';
import { isDirty } from '../git/isDirty';
import type { Checkout } from '../store/createCheckout';

export async function scanWorkspaceState(ctx: WorkspaceContext): Promise<Checkout> {
	const workspacePath = ctx.config.root.path;
	const issues: string[] = [];
	let branch = 'main';
	let detached = false;
	let conflicts = false;
	let dirty = false;
	let hasRemoteVal = false;
	let remoteBranch: string | null = null;
	let unpushed = 0;

	try {
		branch = await getCurrentBranch(workspacePath);
		detached = await isDetachedHead(workspacePath);
		conflicts = await hasMergeConflicts(workspacePath);
		dirty = await isDirty(workspacePath);
		hasRemoteVal = await hasRemote(workspacePath);

		if (hasRemoteVal && branch !== '-' && branch !== 'HEAD') {
			remoteBranch = await getRemoteBranch(workspacePath);
			unpushed = await getUnpushedCount(workspacePath, remoteBranch);
		}
	} catch {
		issues.push('git error');
	}

	if (detached) {
		issues.push('detached HEAD');
	}
	if (conflicts) {
		issues.push('merge conflicts');
	}
	if (!hasRemoteVal) {
		issues.push('no remote');
	}
	if (dirty) {
		issues.push('uncommitted files');
	}
	if (unpushed > 0) {
		issues.push(`${unpushed} commit${unpushed !== 1 ? 's' : ''} ahead`);
	}

	const workspace: Checkout = {
		repo: undefined,
		record: {
			name: 'Workspace',
			location: '.',
			branch,
			repository: undefined,
		},
		path: workspacePath,
		exists: true,
		remoteBranch,
		detached,
		conflicts,
		dirty,
		hasRemote: hasRemoteVal,
		unpushed,
		issues,
		extraneous: false,
	};

	return workspace;
}
