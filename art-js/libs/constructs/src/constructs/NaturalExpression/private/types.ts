import type { ConstructBase } from '@art-js/artificial-primitives';

export interface NaturalExpression extends ConstructBase {
	construct: 'NaturalExpression';
	type: string;
	attributes?: Record<string, unknown>;
	value?: string;
	children?: NaturalExpression[];
}
