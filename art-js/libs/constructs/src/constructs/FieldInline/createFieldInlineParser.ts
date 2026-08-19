import type { ConstructParserFactory } from '../types';

import { createFieldInlineMatcher } from './createFieldInlineMatcher';

export const createFieldInlineParser: ConstructParserFactory = () => ({
	preProcessor: createFieldInlineMatcher(),
});
