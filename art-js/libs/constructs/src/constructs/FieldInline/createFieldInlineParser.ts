import type { ConstructParserFactory } from '../types';

import { createFieldInlinePreProcessor } from './createFieldInlinePreProcessor';

export const createFieldInlineParser: ConstructParserFactory = () => ({
	preProcessor: createFieldInlinePreProcessor(),
});
