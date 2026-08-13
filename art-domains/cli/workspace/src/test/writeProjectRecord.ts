import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeProjectRecord(
	tempDir: string,
	name: string,
	options?: {
		remote?: string;
		canonicalName?: string;
		path?: string;
		namespaces?: string[];
	},
): void {
	const dir = join(tempDir, 'ops/records/projects');
	mkdirSync(dir, { recursive: true });
	const remote = options?.remote ?? 'git@example.com:test.git';
	const canonicalName = options?.canonicalName ?? '@test/' + name.toLowerCase();
	const projectPath = options?.path ?? '.';
	const namespaces = options?.namespaces ?? [];
	const nsLines =
		namespaces.length > 0
			? '\n**Namespaces:**\n' + namespaces.map(ns => `- Namespace: ${ns}`).join('\n') + '\n'
			: '';
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Project: ' +
			name +
			'\n\n**Remote:** `' +
			remote +
			'`\n\n**Canonical Name:** `' +
			canonicalName +
			'`\n\n**Path:** `' +
			projectPath +
			'`' +
			nsLines +
			'\n',
	);
}

export function writeNamespaceRecord(
	tempDir: string,
	name: string,
	options?: {
		path?: string;
		packages?: string[];
	},
): void {
	const dir = join(tempDir, 'ops/records/namespaces');
	mkdirSync(dir, { recursive: true });
	const nsPath = options?.path ?? '.';
	const packages = options?.packages ?? [];
	const pkgLine = packages.length > 0 ? `\n**Packages:** ${packages.join(', ')}\n` : '';
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Namespace: ' + name + '\n\n**Path:** `' + nsPath + '`' + pkgLine + '\n',
	);
}

export function writePackageRecord(
	tempDir: string,
	name: string,
	options?: {
		canonicalName?: string;
		path?: string;
	},
): void {
	const dir = join(tempDir, 'ops/records/packages');
	mkdirSync(dir, { recursive: true });
	const canonicalName = options?.canonicalName ?? '@test/' + name.toLowerCase();
	const pkgPath = options?.path ?? name.toLowerCase();
	writeFileSync(
		join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
		'# Module\n\n## Package: ' +
			name +
			'\n\n**Canonical Name:** `' +
			canonicalName +
			'`\n\n**Path:** `' +
			pkgPath +
			'`\n',
	);
}
