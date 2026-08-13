import { createFieldBlockHandler, createFieldDetectionPreProcessor } from './constructs/FieldBlock';
import type { ConstructPreProcessor } from './constructs/FieldBlock';
import { createSectionBlockHandler, sectionBlockFactory } from './constructs/SectionBlock';
import type { ConstructHandler } from './constructs/SectionBlock';
import { createTagRoutingHandler, tagFactory } from './constructs/Tag';
import type { ConstructFactory } from './framework/types';

export interface ParserConfig {
	preProcessors: ConstructPreProcessor[];
	factories: ConstructFactory[];
	handlers: ConstructHandler[];
}

export function createDefaultConfig(): ParserConfig {
	return {
		preProcessors: [createFieldDetectionPreProcessor()],
		factories: [sectionBlockFactory, tagFactory],
		handlers: [createSectionBlockHandler(), createFieldBlockHandler(), createTagRoutingHandler()],
	};
}
