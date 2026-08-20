import type { RecordFilePattern } from '../../../config';

function matchesPattern(filePath: string, pattern: RecordFilePattern): boolean {
	return typeof pattern === 'string' ? filePath.includes(pattern) : pattern.test(filePath);
}

export function filterByPatterns(
	searchPath: string,
	candidates: string[],
	ignored: Set<string>,
	ignoredPatterns: RecordFilePattern[],
	includedPatterns: RecordFilePattern[],
): string[] {
	return candidates.filter(filePath => {
		const relativePath = filePath.slice(searchPath.length + 1);
		const explicitlyIgnored = ignoredPatterns.some(pattern =>
			matchesPattern(relativePath, pattern),
		);
		const explicitlyIncluded = includedPatterns.some(pattern =>
			matchesPattern(relativePath, pattern),
		);
		return !explicitlyIgnored && (explicitlyIncluded || !ignored.has(filePath));
	});
}
