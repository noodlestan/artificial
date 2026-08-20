export interface SerializerCliArgs {
	doWriteDebug: boolean;
	filterFixture: string | undefined;
}

export interface SerializeResult {
	durationMs: number;
	success: boolean;
	error?: string;
}
