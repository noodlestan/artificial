import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { RepositoryCheckout, WorkspaceConfig } from '../../config/types';

import { loadRepositories } from './repository-record';

export interface CheckoutRecord {
	name: string;
	location: string;
	branch: string;
}

const HARDCODED_TEMPLATE = `# Module

## Checkout: {{ name }}

**Location:** \`{{ location }}\`

**Branch:** \`{{ branch }}\`
`;

export function saveCheckoutRecord(
	file: string,
	data: CheckoutRecord,
	config?: WorkspaceConfig,
	root?: string,
): void {
	let template = HARDCODED_TEMPLATE;
	if (config && root) {
		const templatePath = join(root, config.records.checkouts.template);
		if (existsSync(templatePath)) {
			template = readFileSync(templatePath, 'utf-8');
		}
	}
	const content = template
		.replace('{{ name }}', data.name)
		.replace('{{ location }}', data.location)
		.replace('{{ branch }}', data.branch);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, content);
}

export function readCheckoutRecord(file: string): CheckoutRecord {
	const defaults: CheckoutRecord = {
		name: '',
		location: '',
		branch: 'main',
	};

	if (!existsSync(file)) {
		return defaults;
	}

	const content = readFileSync(file, 'utf-8');

	const nameMatch = content.match(/## Checkout:\s*(.+)/);
	const locationMatch = content.match(/\*\*Location:\*\*\s*`([^`]+)`/);
	const branchMatch = content.match(/\*\*Branch:\*\*\s*`([^`]+)`/);

	if (!nameMatch) {
		console.warn(`checkout record ${file}: missing name, using default`);
	}
	if (!locationMatch) {
		console.warn(`checkout record ${file}: missing location, using default`);
	}
	if (!branchMatch) {
		console.warn(`checkout record ${file}: missing branch, using default`);
	}

	return {
		name: nameMatch?.[1]?.trim() ?? defaults.name,
		location: locationMatch?.[1]?.trim() ?? defaults.location,
		branch: branchMatch?.[1]?.trim() ?? defaults.branch,
	};
}

export function loadCheckouts(config: WorkspaceConfig, root: string): RepositoryCheckout[] {
	const repos = loadRepositories(config, root);
	const dir = join(root, config.records.checkouts.path);
	if (!existsSync(dir)) {
		return [];
	}
	const files = readdirSync(dir).filter(f => f.endsWith('.art'));
	const checkouts: RepositoryCheckout[] = [];
	for (const file of files) {
		const record = readCheckoutRecord(join(dir, file));
		const repo = repos.find(r => r.name === record.name);
		if (repo) {
			checkouts.push({
				repo,
				location: record.location,
				branch: record.branch,
			});
		} else {
			console.warn(`checkout ${record.name}: no such repository record, skipped`);
		}
	}
	return checkouts;
}
