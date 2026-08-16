import type { Position } from './point.js';

/** Base interface implemented by every construct record. */
export interface RecordBase {
	/** Discriminator — the construct class (e.g. 'SectionBlock'). */
	construct: string;
	/** Source position, carried from the token stream. */
	position?: Position;
}
