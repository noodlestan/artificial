export interface RecordFile {
	filename: string;
	searchPath: string;
	path: string;
	content?: string;
	error?: Error;
}
