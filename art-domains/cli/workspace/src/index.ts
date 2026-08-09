#!/usr/bin/env node

import { Command } from 'commander';

export { defineConfig, locateCheckouts, loadWorkspaceConfig } from './config';
export type {
	RepositoryCheckout,
	RepositoryRecord,
	WorkspaceConfig,
	WorkspaceRecord,
} from './config';

const program = new Command();

program.name('art-workspace').description('Workspace orchestration CLI').version('0.0.3');

program
	.command('clone')
	.description('Clone repos from manifest')
	.action(() => {
		console.info('clone command - TODO');
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
	.description('Check repo status')
	.action(() => {
		console.info('sanity command - TODO');
	});

program
	.command('publish')
	.description('Publish packages')
	.action(() => {
		console.info('publish command - TODO');
	});

program.parse();
