#!/usr/bin/env node

import { Command } from 'commander';

import { runBranch } from './commands/branch/runBranch';
import { runClone } from './commands/clone/runClone';
import { runLink } from './commands/link/runLink';
import { runPublish } from './commands/publish/runPublish';
import { runRepo } from './commands/repo/runRepo';
import { runSanity } from './commands/sanity/runSanity';
import { runUnlink } from './commands/unlink/runUnlink';
import { loadWorkspaceConfig } from './config/loadWorkspaceConfig';
import { createWorkspaceContext } from './private/context/createWorkspaceContext';
import { createOperationsLog } from './private/log/createOperationsLog';
import { createCheckoutStore } from './private/store/createCheckoutStore';

export { defineConfig, loadWorkspaceConfig } from './config';
export type { WorkspaceConfig } from './config';

const program = new Command();

program.name('art-workspace').description('Workspace orchestration CLI').version('0.0.9');

program
	.command('sanity')
	.description('Check git status across all repos')
	.option('--auto', 'push clean unpushed repos')
	.action(async (options: { auto?: boolean }) => {
		const root = process.cwd();
		const config = await loadWorkspaceConfig(root);
		const store = createCheckoutStore();
		const log = createOperationsLog();
		const ctx = createWorkspaceContext(config, store, log);

		const auto = options.auto ?? false;
		await runSanity(ctx, { auto });
	});

program
	.command('clone')
	.description('Clone repos from manifest')
	.option('--all', 'clone all repos')
	.argument('[name]', 'repo name to clone')
	.argument('[target]', 'target location (relative to checkouts path)')
	.action(
		async (
			repoName: string | undefined,
			checkoutInput: string | undefined,
			options: { all?: boolean },
		) => {
			const root = process.cwd();
			const config = await loadWorkspaceConfig(root);
			const store = createCheckoutStore();
			const log = createOperationsLog();
			const ctx = createWorkspaceContext(config, store, log);

			await runClone(ctx, { all: options.all, repoName, checkoutInput });
		},
	);

program
	.command('branch')
	.description('Branch across checkouts')
	.argument('<branch>', 'branch name to create or switch to')
	.argument('[checkouts...]', 'checkouts to branch (default: all checkouts)')
	.action(async (branch: string, checkoutLocations: string[]) => {
		const root = process.cwd();
		const config = await loadWorkspaceConfig(root);
		const store = createCheckoutStore();
		const log = createOperationsLog();
		const ctx = createWorkspaceContext(config, store, log);
		await runBranch(ctx, { branch, checkoutLocations });
	});

program
	.command('repo')
	.description('List repositories, namespaces, and packages')
	.argument('[checkouts...]', 'checkout names to list (default: all checkouts)')
	.action(async (checkoutNames: string[]) => {
		const root = process.cwd();
		const config = await loadWorkspaceConfig(root);
		const store = createCheckoutStore();
		const log = createOperationsLog();
		const ctx = createWorkspaceContext(config, store, log);
		await runRepo(ctx, { checkoutNames });
	});

program
	.command('link')
	.description('Link packages for local dev')
	.action(async () => {
		const root = process.cwd();
		await runLink({ root });
	});

program
	.command('unlink')
	.description('Unlink packages')
	.action(async () => {
		const root = process.cwd();
		await runUnlink({ root });
	});

program
	.command('publish')
	.description('Publish packages')
	.option('--auto', 'auto-publish')
	.action(async (options: { auto?: boolean }) => {
		const root = process.cwd();
		await runPublish({ root, auto: options.auto });
	});

program.parse();
