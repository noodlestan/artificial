import type { WorkspaceContext } from '../../context/createWorkspaceContext';
import { createOrSwitchBranch } from '../../git/createOrSwitchBranch';
import { saveCheckoutRecord } from '../../resources/checkout/saveCheckoutRecord';
import type { Checkout } from '../../store/createCheckout';
import { createBranchFailure } from '../operations/createBranchFailure';
import { createBranchSuccess } from '../operations/createBranchSuccess';

export async function doBranchCheckout(
	ctx: WorkspaceContext,
	checkout: Checkout,
	branch: string,
): Promise<Checkout | null> {
	try {
		const outcome = await createOrSwitchBranch(checkout.path, branch);
		if (outcome === 'created') {
			ctx.log.log(createBranchSuccess(checkout, branch, `created ${branch}`));
		} else {
			ctx.log.log(createBranchSuccess(checkout, branch, `switched to ${branch}`));
		}

		const updated = { ...checkout, record: { ...checkout.record, branch } };
		ctx.store.updateCheckout(updated);
		await saveCheckoutRecord(ctx.config, updated.record, updated.filename);
		return updated;
	} catch (error) {
		const op = createBranchFailure(branch, error, checkout);
		ctx.log.log(op);
		return null;
	}
}
