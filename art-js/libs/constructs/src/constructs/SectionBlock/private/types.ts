import type { ConstructBase } from '@art-js/artificial-primitives';

import type { BlockContent } from '../../../registry';
import type { Tag } from '../../Tag/private/types';

export interface SectionBlock extends ConstructBase {
	construct: 'SectionBlock';
	kind?: string;
	name: string;
	tags?: Tag[];
	children: BlockContent[];
	depth?: number;
}
