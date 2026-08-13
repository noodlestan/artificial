import { createFieldBlockFromParagraph, fieldBlockFactory } from './constructs/FieldBlock/factory';
import { createFieldBlockHandler } from './constructs/FieldBlock/handler';
import { createFieldDetectionPreProcessor } from './constructs/FieldBlock/preProcessor';
import type { ConstructPreProcessor } from './constructs/FieldBlock/preProcessor';
import { createNaturalBlock, naturalBlockFactory } from './constructs/NaturalBlock/factory';
import { sectionBlockFactory } from './constructs/SectionBlock/factory';
import { createSectionBlockHandler } from './constructs/SectionBlock/handler';
import type { ConstructHandler } from './constructs/SectionBlock/handler';
import { tagFactory } from './constructs/Tag/factory';
import { createTagRoutingHandler } from './constructs/Tag/handler';
import { cleanPosition } from './framework/cleanPosition';
import { createDocumentContext } from './framework/createDocumentContext';
import { createNestedContext } from './framework/createNestedContext';
import type { MdastNode, VisitContext } from './framework/createNestedContext';
import { findTagable } from './framework/findTagable';
import { flushGap } from './framework/flushGap';
import { getFactory } from './framework/getFactory';
import type { ConstructFactory } from './framework/getFactory';
import { rawSlice } from './framework/rawSlice';
import { sectionDepth } from './framework/sectionDepth';

export interface ParserConfig {
	preProcessors: ConstructPreProcessor[];
	factories: ConstructFactory[];
	handlers: ConstructHandler[];
}

const BLOCK_TYPES = new Set([
	'paragraph',
	'code',
	'list',
	'blockquote',
	'table',
	'thematicBreak',
	'html',
	'definition',
]);

export function isBlockType(type: string): boolean {
	return BLOCK_TYPES.has(type);
}

export function createDefaultConfig(): ParserConfig {
	return {
		preProcessors: [createFieldDetectionPreProcessor()],
		factories: [sectionBlockFactory, tagFactory],
		handlers: [createSectionBlockHandler(), createFieldBlockHandler(), createTagRoutingHandler()],
	};
}

export type { MdastNode, VisitContext, ConstructFactory, ConstructHandler, ConstructPreProcessor };

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
