import {
	createFieldBlockFromParagraph,
	createFieldBlockHandler,
	createFieldDetectionPreProcessor,
	fieldBlockFactory,
} from './constructs/FieldBlock';
import { createNaturalBlock, naturalBlockFactory } from './constructs/NaturalBlock';
import { createSectionBlockHandler, sectionBlockFactory } from './constructs/SectionBlock';
import { createTagRoutingHandler, tagFactory } from './constructs/Tag';
import { cleanPosition } from './framework/cleanPosition';
import { createDocumentContext } from './framework/createDocumentContext';
import { createNestedContext } from './framework/createNestedContext';
import { findTagable } from './framework/findTagable';
import { flushGap } from './framework/flushGap';
import { getFactory } from './framework/getFactory';
import { rawSlice } from './framework/rawSlice';
import { sectionDepth } from './framework/sectionDepth';

// Re-export framework types
export type { ConstructFactory, MdastNode, VisitContext } from './framework/types';

// Re-export construct public APIs
export type { ConstructPreProcessor } from './constructs/FieldBlock';
export type { ConstructHandler } from './constructs/SectionBlock';

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
