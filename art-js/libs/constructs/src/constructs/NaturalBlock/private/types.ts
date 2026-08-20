import type { ConstructBase } from '@art-js/artificial-primitives';

import type { BlockContent } from '../../../registry';
import type { NaturalExpression } from '../../NaturalExpression/private/types';

export interface NaturalBlock extends ConstructBase {
	construct: 'NaturalBlock';
	value: string;
	children?: BlockContent[] | NaturalExpression[];
	type?: string;
	lang?: string | null;
	meta?: string | null;
	[key: string]: unknown;
}
