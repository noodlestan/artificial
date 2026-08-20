import type { ConstructBase } from '@art-js/artificial-primitives';

import type { NaturalExpression } from '../../NaturalExpression/private/types';

export interface FieldInline extends ConstructBase {
	construct: 'FieldInline';
	name: string;
	value: NaturalExpression[];
}
