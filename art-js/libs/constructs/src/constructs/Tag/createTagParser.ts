import type { ConstructParserFactory } from '../types';

import { createTagCreator } from './private/createTagCreator';
import { createTagRoutingHandler } from './private/createTagRoutingHandler';

export const createTagParser: ConstructParserFactory = () => ({
	handler: createTagRoutingHandler(),
	factory: createTagCreator(),
});
