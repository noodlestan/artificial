import type { Text } from 'mdast';

import { cleanPosition } from '../../../helpers/cleanPosition';
import type { ConstructCreator } from '../../types';

import { TAG_PATTERN } from './constants';

export function createTagCreator(): ConstructCreator {
	return {
		detect(node) {
			return node.type === 'text' && TAG_PATTERN.test((node as Text).value);
		},
		create(node) {
			const text = node as Text;
			TAG_PATTERN.lastIndex = 0;
			return [...text.value.matchAll(TAG_PATTERN)].map(match => ({
				construct: 'Tag' as const,
				name: match[1] ?? '',
				position: cleanPosition(text.position),
			}));
		},
		shouldVisit: false,
	};
}
