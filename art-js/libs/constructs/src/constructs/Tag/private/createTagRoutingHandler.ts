import type { SectionBlock } from '../../SectionBlock/private/types';
import type { ConstructHandler } from '../../types';

import { findTagable } from './findTagable';
import type { Tag } from './types';

export function createTagRoutingHandler(): ConstructHandler {
	return {
		handle(record, _node, context) {
			const section = findTagable(context) as SectionBlock;
			if (section) {
				(section.tags ??= []).push(record as Tag);
			}
			return context;
		},
	};
}
