/** A point in the source. */
export interface Point {
	line: number;
	column: number;
	offset: number;
}

/** The source span of a record. */
export interface Position {
	start: Point;
	end: Point;
}
