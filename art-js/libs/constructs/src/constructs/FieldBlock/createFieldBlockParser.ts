import type { ConstructParserFactory } from '../types';

import { createFieldBlockHandler } from './private/createFieldBlockHandler';
import { createFieldBlockPreProcessor } from './private/createFieldBlockPreProcessor';

export const createFieldBlockParser: ConstructParserFactory = () => ({
	preProcessor: createFieldBlockPreProcessor(),
	handler: createFieldBlockHandler(),
});
