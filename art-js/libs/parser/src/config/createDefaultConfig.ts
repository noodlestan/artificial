import {
	createFieldBlockParser,
	createNaturalBlockParser,
	createSectionBlockParser,
	createTagParser,
} from '@art-js/artificial-constructs';

import type { ParserConfig } from './types';

export function createDefaultConfig(): ParserConfig {
	return {
		defaultConstruct: createNaturalBlockParser,
		constructs: [createFieldBlockParser, createSectionBlockParser, createTagParser],
	};
}
