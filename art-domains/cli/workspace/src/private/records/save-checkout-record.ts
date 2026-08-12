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

export async function saveCheckoutRecord(
	config: WorkspaceConfig,
	file: string,
	data: CheckoutRecord,
): Promise<string> {
	let template = HARDCODED_TEMPLATE;
	const templatePath = join(config.root.path, config.records.checkouts.template);
	if (existsSync(templatePath)) {
		template = readFileSync(templatePath, 'utf-8');
	}

	const fileName = join(
		config.root.path,
		config.records.checkouts.path,
		`${file.toLowerCase().replace(/\s+/g, '-')}.art`,
	);

	let content = template
		.replace('{{ name }}', data.name)
		.replace('{{ repository }}', data.repository ?? '')
		.replace('{{ location }}', data.location)
		.replace('{{ branch }}', data.branch);

	if (!data.repository) {
		content = content.replace(/\*\*Repository:\*\*\s*\n\n?/g, '');
	}
	mkdirSync(dirname(fileName), { recursive: true });
	writeFileSync(fileName, content);

	return fileName;
}
