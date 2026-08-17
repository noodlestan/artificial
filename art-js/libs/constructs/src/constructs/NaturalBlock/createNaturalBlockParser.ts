import type { ConstructParserFactory } from '../types';

import { createNaturalBlockCreator } from './private/createNaturalBlockCreator';

export const createNaturalBlockParser: ConstructParserFactory = () => ({
	factory: createNaturalBlockCreator(),
});
