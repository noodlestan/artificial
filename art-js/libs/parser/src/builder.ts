import {
	type ArtDocument,
	type BlockContent,
	type Construct,
	type ConstructHandler,
} from '@art-js/artificial-constructs';
import type { Point, VisitContext } from '@art-js/artificial-primitives';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Node } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

import type { ParserConfig } from './config/types';
import { isBlockType } from './constants';
import { createDocumentContext } from './private/createDocumentContext';
import { flushGap } from './private/flushGap';
import { getFactory } from './private/getFactory';

interface HandleResult {
	records: Construct[];
	handler: ConstructHandler | null;
}

export function buildDocument(config: ParserConfig, markdown: string): ArtDocument {
	const tree = fromMarkdown(markdown);
	const docContext = createDocumentContext(markdown);
	const defaultConstruct = config.defaultConstruct();
	const constructs = [defaultConstruct, ...config.constructs.map(create => create())];
	let currentContext: VisitContext = docContext;
	let lastEnd: Point | undefined;

	function updateLastEnd(end: Point): void {
		lastEnd = { line: end.line, column: end.column, offset: end.offset };
		currentContext.lastEnd = lastEnd;
	}

	function tryPreProcessors(node: Node): HandleResult | null {
		for (const construct of constructs) {
			const preProcessor = construct.preProcessor;
			const record = preProcessor?.preProcess(node, currentContext);
			if (record) {
				const rec = record as Construct;
				const handler = construct.handler ?? null;
				return { records: [rec], handler };
			}
		}
		return null;
	}

	function maybeHandleFactory(node: Node): HandleResult | null {
		if (node.type === 'root') return null;

		const construct = getFactory(node, currentContext, constructs);
		if (!construct?.factory) return null;

		const result = construct.factory.create(node, currentContext);
		const records = Array.isArray(result) ? result : [result];
		const firstRecord = records[0] as Construct | undefined;
		const handler = records.length > 0 && firstRecord ? (construct.handler ?? null) : null;

		return { records, handler };
	}

	function handleNaturalBlock(node: Node): typeof SKIP | undefined {
		if (!defaultConstruct.factory) return SKIP;
		const record = defaultConstruct.factory.create(node, currentContext) as Construct;
		currentContext = currentContext.beforeRecord(record);
		if (record.position) flushGap(record.position.start, lastEnd, markdown, currentContext);
		currentContext.push(record);
		if (record.position) {
			updateLastEnd(record.position.end);
		}
		return node.type === 'paragraph' ? undefined : SKIP;
	}

	function dispatch(node: Node, records: Construct[], handler: ConstructHandler | null): void {
		for (const record of records) {
			currentContext = currentContext.beforeRecord(record);

			if (record.position) flushGap(record.position.start, lastEnd, markdown, currentContext);

			if (handler) {
				currentContext = handler.handle(record, node, currentContext);
			} else {
				currentContext.push(record as BlockContent);
			}

			if (record.position) updateLastEnd(record.position.end);
		}
	}

	function visitNode(node: Node): typeof SKIP | undefined {
		if (node.type === 'root') return undefined;

		const preResult = tryPreProcessors(node);
		if (preResult) {
			dispatch(node, preResult.records, preResult.handler);
			return SKIP;
		}

		const factoryResult = maybeHandleFactory(node);
		if (factoryResult) {
			const { records, handler } = factoryResult;
			dispatch(node, records, handler);
			return SKIP;
		}

		if (isBlockType(node.type)) {
			return handleNaturalBlock(node);
		}

		return SKIP;
	}

	// The mdast `fromMarkdown` result has version-specific types; cast to `any` for
	// the visitor. This is a pragmatic choice during migration.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	visit(tree as any, (n: Node) => visitNode(n));

	return { construct: 'Document', children: docContext.target() as BlockContent[] };
}
