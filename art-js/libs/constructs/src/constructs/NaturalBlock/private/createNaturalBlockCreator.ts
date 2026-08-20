import type { ConstructCreator } from '../../types';

import { createNaturalBlock } from './createNaturalBlock';

export function createNaturalBlockCreator(): ConstructCreator {
	return {
		detect: () => true,
		create: (node, context) => createNaturalBlock(node, context),
	};
}
