import type { ConstructParserFactory } from '../types';

import { createSectionBlockCreator } from './private/createSectionBlockCreator';
import { createSectionBlockHandler } from './private/createSectionBlockHandler';

export const createSectionBlockParser: ConstructParserFactory = () => ({
	handler: createSectionBlockHandler(),
	factory: createSectionBlockCreator(),
});
