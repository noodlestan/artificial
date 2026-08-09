#!/usr/bin/env node

import { Command } from 'commander';

import { runClone } from './clone';
import { runSanity } from './sanity';

export { defineConfig, locateCheckouts, loadWorkspaceConfig, verifyCheckouts } from './config';
export type {
	CheckoutConfig,
	RepositoryCheckout,
	RepositoryRecord,
	WorkspaceConfig,
	WorkspaceRecord,
} from './config';

const program = new Command();

program.name('art-workspace').description('Workspace orchestration CLI').version('0.0.8');

program
	.command('clone')
	.description('Clone repos from manifest')
	.argument('[names...]', 'repo names to clone (or "all")')
	.action(async (names: string[]) => {
		const root = process.cwd();
		await runClone({ root, names });
	});

program
	.command('branch')
	.description('Branch across repos')
	.action(() => {
		console.info('branch command - TODO');
	});

program
	.command('link')
	.description('Link packages for local dev')
	.action(() => {
		console.info('link command - TODO');
	});

program
	.command('sanity')
	.description('Check git status across all repos')
	.option('--auto', 'push clean unpushed repos')
	.action(async (options: { auto?: boolean }) => {
		const root = process.cwd();
		await runSanity({ root, auto: options.auto ?? false });
	});

program
	.command('publish')
	.description('Publish packages')
	.action(() => {
		console.info('publish command - TODO');
	});

program.parse();
