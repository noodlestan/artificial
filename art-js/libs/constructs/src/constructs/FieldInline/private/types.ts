import type { ConstructBase } from '@art-js/artificial-primitives';

export interface FieldInline extends ConstructBase {
	construct: 'FieldInline';
	name: string;
	value: string;
}
