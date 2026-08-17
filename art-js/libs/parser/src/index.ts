import {
	createFieldBlockFromParagraph,
	createNaturalBlock,
	fieldBlockFactory,
	naturalBlockFactory,
	sectionBlockFactory,
} from '@art-js/artificial-constructs';

import { buildDocument } from './builder';
import { createDefaultConfig } from './config';
import { createFieldBlockHandler, createFieldDetectionPreProcessor } from './constructs/FieldBlock';
import { createSectionBlockHandler } from './constructs/SectionBlock';
import { createTagRoutingHandler, tagFactory } from './constructs/Tag';
import { cleanPosition } from './framework/cleanPosition';
import { createDocumentContext } from './framework/createDocumentContext';
import { createNestedContext } from './framework/createNestedContext';
import { findTagable } from './framework/findTagable';
import { flushGap } from './framework/flushGap';
import { getFactory } from './framework/getFactory';
import { rawSlice } from './framework/rawSlice';
import { sectionDepth } from './framework/sectionDepth';
import type { Document } from './types';

// Re-export framework types
export type { ConstructFactory, MdastNode, VisitContext } from './framework/types';

// Re-export construct public APIs
export type { ConstructPreProcessor } from './constructs/FieldBlock/preProcessor';
export type { ConstructHandler } from './constructs/SectionBlock/handler';

// Re-export construct implementations
export {
	cleanPosition,
	createDocumentContext,
	createFieldBlockFromParagraph,
	createFieldBlockHandler,
	createFieldDetectionPreProcessor,
	createNaturalBlock,
	createNestedContext,
	createSectionBlockHandler,
	createTagRoutingHandler,
	fieldBlockFactory,
	findTagable,
	flushGap,
	getFactory,
	naturalBlockFactory,
	rawSlice,
	sectionBlockFactory,
	sectionDepth,
	tagFactory,
};

// Local exports
export { isBlockType } from './constants';
export { createDefaultConfig } from './config';
export type { ParserConfig } from './config';

export function parse(markdown?: string): Document {
	const config = createDefaultConfig();
	return buildDocument(markdown ?? '', config);
}
