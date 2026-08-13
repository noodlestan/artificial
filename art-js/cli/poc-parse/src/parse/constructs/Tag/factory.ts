import type { Text } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import type { ConstructFactory } from '../../framework/types';
import type { Tag } from '../../types';

import { TAG_PATTERN } from './constants';

export const tagFactory: ConstructFactory = {
	detect(node) {
		return node.type === 'text' && TAG_PATTERN.test((node as Text).value);
	},
	create(node) {
		const text = node as Text;
		const match = text.value.match(TAG_PATTERN);
		const tag: Tag = {
			construct: 'Tag',
			name: match ? match[1] : '',
		};
		tag.position = cleanPosition(text.position);
		return tag;
	},
	shouldVisit: false,
};
