import {
	createFieldBlockParser,
	createFieldInlineParser,
	createNaturalBlockParser,
	createSectionBlockParser,
	createTagParser,
} from '@art-js/artificial-constructs';

import type { ParserConfig } from './types';

export function createDefaultConfig(): ParserConfig {
	return {
		defaultConstruct: createNaturalBlockParser,
		constructs: [
			createFieldInlineParser,
			createFieldBlockParser,
			createSectionBlockParser,
			createTagParser,
		],
	};
}
