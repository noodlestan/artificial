export function getFilterFixtureArg(): string | undefined {
	const idx = process.argv.indexOf('--fixture');
	if (idx === -1) return undefined;
	const next = process.argv[idx + 1];
	if (!next || next.startsWith('--')) {
		console.error('No fixture provided. Usage: npm run test -- --fixture <filename>');
		process.exit(2);
	}
	return next;
}
