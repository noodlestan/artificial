import { findTagable } from '../../framework/findTagable';
import type { Tag } from '../../types';
import type { ConstructHandler } from '../SectionBlock/handler';

export function createTagRoutingHandler(): ConstructHandler {
	return {
		canHandle(record) {
			return record.construct === 'Tag';
		},
		handle(record, _node, context) {
			const section = findTagable(context);
			if (section) {
				(section.tags ??= []).push(record as Tag);
			}
			return context;
		},
	};
}
