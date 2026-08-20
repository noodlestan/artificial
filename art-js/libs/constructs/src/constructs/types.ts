/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';
import type { Node } from 'mdast';

import type { Construct } from '../registry';

export interface ConstructCreator {
	detect(node: MdastNode, context: VisitContext): boolean;
	create(node: MdastNode, context: VisitContext): Construct | Construct[];
}

export interface ConstructPreProcessor {
	preProcess(node: MdastNode, context: VisitContext): Construct | null;
}

export interface ConstructHandler {
	handle(record: Construct, node: MdastNode, context: VisitContext): VisitContext;
}

export interface ConstructParser {
	preProcessor?: ConstructPreProcessor;
	handler?: ConstructHandler;
	factory?: ConstructCreator;
}

export type ConstructParserFactory = () => ConstructParser;

export interface ConstructToMdast {
	construct: string;
	toMdast(node: Construct, children: Node[]): Node;
}

export type ConstructToMdastFactory = () => ConstructToMdast;
