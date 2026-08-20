import {
	createDocumentToMdast,
	createFieldBlockToMdast,
	createFieldInlineToMdast,
	createNaturalBlockToMdast,
	createNaturalExpressionToMdast,
	createSectionBlockToMdast,
	createTagToMdast,
} from '@art-js/artificial-constructs';

import type { SerializerConfig } from './types';

export function createDefaultSerializerConfig(): SerializerConfig {
	return {
		constructs: [
			createDocumentToMdast,
			createNaturalBlockToMdast,
			createNaturalExpressionToMdast,
			createFieldBlockToMdast,
			createFieldInlineToMdast,
			createSectionBlockToMdast,
			createTagToMdast,
		],
	};
}
