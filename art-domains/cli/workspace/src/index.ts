#!/usr/bin/env node

import { Command } from 'commander';

import { runBranch } from './commands/branch/branch';
import { runClone } from './commands/clone/clone';
import { runLink } from './commands/link/link';
import { runPublish } from './commands/publish/publish';
import { runSanity } from './commands/sanity/sanity';
import { runUnlink } from './commands/unlink/unlink';

export { defineConfig, loadWorkspaceConfig, verifyCheckouts } from './config';
export type { RepositoryCheckout, RepositoryRecord, WorkspaceConfig } from './config';

const program = new Command();

program.name('art-workspace').description('Workspace orchestration CLI').version('0.0.9');

program
	.command('clone')
	.description('Clone repos from manifest')
	.option('--all', 'clone all repos')
	.argument('[name]', 'repo name to clone')
	.argument('[target]', 'target location (relative to checkouts path)')
	.action(
		async (name: string | undefined, target: string | undefined, options: { all?: boolean }) => {
			const root = process.cwd();
			await runClone({ root, all: options.all, name, target });
		},
	);

program
	.command('branch')
	.description('Branch across checkouts')
	.argument('<branch>', 'branch name to create or switch to')
	.argument('[checkouts...]', 'checkouts to branch (default: all checkouts)')
	.action(async (branch: string, checkoutNames: string[]) => {
		const root = process.cwd();
		const config = await (await import('./config/load-config')).loadWorkspaceConfig(root);
		const { createCheckoutStore } = await import('./shared/checkout-store');
		const { createOperationsLog } = await import('./shared/operations-log');
		const { createWorkspaceContext } = await import('./shared/workspace-context');
		const store = createCheckoutStore(config, root);
		const log = createOperationsLog();
		const ctx = createWorkspaceContext(config, root, store, log);
		await runBranch(ctx, branch, checkoutNames);
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
	.command('sanity')
	.description('Check git status across all repos')
	.option('--auto', 'push clean unpushed repos')
	.action(async (options: { auto?: boolean }) => {
		const root = process.cwd();
		const config = await (await import('./config/load-config')).loadWorkspaceConfig(root);
		const { createCheckoutStore } = await import('./shared/checkout-store');
		const { createOperationsLog } = await import('./shared/operations-log');
		const { createWorkspaceContext } = await import('./shared/workspace-context');
		const store = createCheckoutStore(config, root);
		const log = createOperationsLog();
		const ctx = createWorkspaceContext(config, root, store, log);
		await runSanity(ctx, options.auto ?? false);
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
