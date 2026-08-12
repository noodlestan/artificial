import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { WorkspaceConfig } from '../../config/types';

import { CheckoutRecord } from './types';

const HARDCODED_TEMPLATE = `# Module

## Checkout: {{ name }}

**Repository:** {{ repository }}

**Location:** \`{{ location }}\`

**Branch:** \`{{ branch }}\`
`;

export function saveCheckoutRecord(
	config: WorkspaceConfig,
	file: string,
	data: CheckoutRecord,
): void {
	let template = HARDCODED_TEMPLATE;
	const templatePath = join(config.root.path, config.records.checkouts.template);
	if (existsSync(templatePath)) {
		template = readFileSync(templatePath, 'utf-8');
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
