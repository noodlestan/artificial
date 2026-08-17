import type { ConstructBase } from '@art-js/artificial-primitives';

import type { BlockContent } from '../../../registry';

export interface NaturalBlock extends ConstructBase {
	construct: 'NaturalBlock';
	value: string;
	children?: BlockContent[];
	type?: string;
	lang?: string | null;
	meta?: string | null;
	[key: string]: unknown;
}
