export interface ParserCliArgs {
	doWrite: boolean;
	doWriteDebug: boolean;
	filterFixture: string | undefined;
}

export interface ParseResult {
	success: boolean;
	document?: unknown;
	error?: string;
	durationMs: number;
}
