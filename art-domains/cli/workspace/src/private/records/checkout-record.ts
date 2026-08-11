import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { CheckoutRecord, WorkspaceConfig } from '../../config/types';

const HARDCODED_TEMPLATE = `# Module

## Checkout: {{ name }}

**Repository:** {{ repository }}

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
	let content = template
		.replace('{{ name }}', data.name)
		.replace('{{ repository }}', data.repository ?? '')
		.replace('{{ location }}', data.location)
		.replace('{{ branch }}', data.branch);
	// Remove empty repository line if not provided
	if (!data.repository) {
		content = content.replace(/\*\*Repository:\*\*\s*\n\n?/g, '');
	}
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
	const repositoryMatch = content.match(/\*\*Repository:\*\*\s*(.+)/);
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
		repository: repositoryMatch?.[1]?.trim(),
		location: locationMatch?.[1]?.trim() ?? defaults.location,
		branch: branchMatch?.[1]?.trim() ?? defaults.branch,
	};
}
