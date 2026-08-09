import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export interface CheckoutRecord {
	name: string;
	location: string;
	branch: string;
}

const TEMPLATE = `# Module

## Checkout: {{ name }}

**Location:** \`{{ location }}\`

**Branch:** \`{{ branch }}\`
`;

export function saveCheckoutRecord(file: string, data: CheckoutRecord): void {
	const content = TEMPLATE.replace('{{ name }}', data.name)
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
