/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';

import type { Construct } from '../registry';

export interface ConstructCreator {
	detect(node: MdastNode, context: VisitContext): boolean;
	create(node: MdastNode, context: VisitContext): Construct | Construct[];
	shouldVisit: boolean;
}

export interface ConstructPreProcessor {
	canPreProcess(node: MdastNode, context: VisitContext): boolean;
	preProcess(node: MdastNode, context: VisitContext): Construct | null;
}

export interface ConstructHandler {
	canHandle(record: Construct): boolean;
	handle(record: Construct, node: MdastNode, context: VisitContext): VisitContext;
}

export interface ConstructParser {
	preProcessor?: ConstructPreProcessor;
	handler?: ConstructHandler;
	factory?: ConstructCreator;
}

export type ConstructParserFactory = () => ConstructParser;
