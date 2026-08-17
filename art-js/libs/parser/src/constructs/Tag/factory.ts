import type { Text } from 'mdast';

import { cleanPosition } from '../../framework/cleanPosition';
import type { ConstructFactory } from '../../framework/types';

import { TAG_PATTERN } from './constants';

export const tagFactory: ConstructFactory = {
	detect(node) {
		return node.type === 'text' && TAG_PATTERN.test((node as Text).value);
	},
	create(node) {
		const text = node as Text;
		TAG_PATTERN.lastIndex = 0; // Reset before matchAll since test() advances it
		const matches = [...text.value.matchAll(TAG_PATTERN)];
		return matches.map(match => ({
			construct: 'Tag',
			name: match[1] ?? '',
			position: cleanPosition(text.position),
		}));
	},
	shouldVisit: false,
};
