export interface SerializerCliArgs {
	doWriteDebugResult: boolean;
	filterFixture: string | undefined;
}

export interface SerializeResult {
	durationMs: number;
	success: boolean;
	error?: string;
}
