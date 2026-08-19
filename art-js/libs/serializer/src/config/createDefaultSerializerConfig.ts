import {
	createDocumentToMdast,
	createFieldBlockToMdast,
	createFieldInlineToMdast,
	createNaturalBlockToMdast,
	createSectionBlockToMdast,
	createTagToMdast,
} from '@art-js/artificial-constructs';

import type { SerializerConfig } from './types';

export function createDefaultSerializerConfig(): SerializerConfig {
	return {
		constructs: [
			createDocumentToMdast,
			createNaturalBlockToMdast,
			createFieldBlockToMdast,
			createFieldInlineToMdast,
			createSectionBlockToMdast,
			createTagToMdast,
		],
	};
}
