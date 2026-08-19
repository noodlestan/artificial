export interface SummaryOpts {
	fixturesTotal: number;
	tested: number;
	totalTimeMs: number;
	operationTimeMs: number;
	operationLabel: string;
	failed: number;
}

export function printSummary(opts: SummaryOpts): void {
	const { fixturesTotal, tested, totalTimeMs, operationTimeMs, operationLabel, failed } = opts;

	console.info('\n' + '='.repeat(50));
	console.info(`Results: ${fixturesTotal} fixtures tested`);
	if (tested < fixturesTotal) {
		console.warn(`Skipped: ${fixturesTotal - tested} fixtures`);
	}
	console.info(`Total time: ${totalTimeMs}ms`);
	console.info(`${operationLabel}: ${operationTimeMs}ms`);
	console.info(`Overhead: ${totalTimeMs - operationTimeMs}ms`);
	console.info('='.repeat(50));

	if (failed === 0) {
		console.info('\nAll fixtures passed!');
	} else {
		console.error(`\n${failed} snapshot check(s) failed`);
	}
}
