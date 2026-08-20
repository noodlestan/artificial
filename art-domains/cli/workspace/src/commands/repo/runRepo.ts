import type { WorkspaceContext } from '../../private/context/createWorkspaceContext';
import { presentCheckoutRepositoryState } from '../../private/present/presentCheckoutRepositoryState';
import { presentPackageStateReport } from '../../private/present/presentPackageStateReport';
import { getRepositoryCheckoutPackages } from '../../private/repositories/getRepositoryCheckoutPackages';
import { loadCheckoutRecords } from '../../private/resources/checkout/loadCheckoutRecords';
import { loadProjectGraph } from '../../private/resources/projectGraph/loadProjectGraph';
import { loadRepositoryRecords } from '../../private/resources/repository/loadRepositoryRecords';
import type { PackageStateRecord, ProjectGraph } from '../../private/resources/types';
import { hydrateStoreFromRecords } from '../../private/store/hydrateStoreFromRecords';
import { scanAllCheckoutsStates } from '../../private/store/scanAllCheckoutsStates';
import { Checkout } from '../../private/store/types';

export interface CheckoutRepositoryState {
	target: import('../../private/store/types').Checkout;
	branch: string | null;
	issues: string[];
	graph: ProjectGraph;
}

export async function runRepo(
	ctx: WorkspaceContext,
	options: { locations?: string[] },
): Promise<void> {
	const repos = await loadRepositoryRecords(ctx.config);
	const records = await loadCheckoutRecords(ctx.config, repos);
	hydrateStoreFromRecords(ctx.config, ctx.store, records);
	await scanAllCheckoutsStates(ctx.store);

	const { locations = [] } = options;

	const checkouts: Map<string, Checkout> = new Map();
	if (locations.length === 0) {
		const all = ctx.store.getAllCheckouts();
		all.forEach(checkout => checkouts.set(checkout.record.location, checkout));
	} else {
		for (const name of locations) {
			const checkout = ctx.store.getCheckoutByName(name) ?? ctx.store.getCheckoutForLocation(name);
			if (!checkout) {
				console.warn(`unknown checkout: ${name}`);
				continue;
			}
			checkouts.set(checkout.record.location, checkout);
		}
	}

	const repositoryCheckoutStates = new Map<string, CheckoutRepositoryState>();
	const repositoryCheckoutPackages = new Map<string, PackageStateRecord[]>();

	for (const [location, checkout] of checkouts) {
		const graph = await loadProjectGraph(ctx.config, checkout.path);
		const repositoryState: CheckoutRepositoryState = {
			target: checkout,
			branch: checkout.scan?.state('remote').branch ?? checkout.record.branch,
			issues: [],
			graph,
		};
		repositoryCheckoutStates.set(location, repositoryState);

		for (const w of graph.warnings) {
			console.warn(w);
		}

		if (graph.projects.length === 0) {
			repositoryState.issues.push('no project records');
			continue;
		}

		const packageStates = getRepositoryCheckoutPackages(checkout.path, graph);
		repositoryCheckoutPackages.set(location, packageStates);
	}

	for (const [location, state] of repositoryCheckoutStates) {
		presentCheckoutRepositoryState(state);
		const packageStates = repositoryCheckoutPackages.get(location) ?? [];
		presentPackageStateReport(state.target, packageStates);
	}
}
