import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Node } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

import type { BlockContent, Construct, Document, Point } from './types';

import {
	createDocumentContext,
	createNaturalBlock,
	flushGap,
	getFactory,
	isBlockType,
} from './index';
import type { ConstructHandler, ParserConfig, VisitContext } from './index';

interface HandleResult {
	record: Construct;
	handler: ConstructHandler | null;
	shouldVisit: boolean;
}

export function buildDocument(markdown: string, config: ParserConfig): Document {
	const tree = fromMarkdown(markdown);
	const docContext = createDocumentContext(markdown);
	let currentContext: VisitContext = docContext;
	let lastEnd: Point | undefined;

	function updateLastEnd(end: Point): void {
		lastEnd = { line: end.line, column: end.column, offset: end.offset };
		currentContext.lastEnd = lastEnd;
	}

	function tryPreProcessors(node: Node): HandleResult | null {
		for (const preProcessor of config.preProcessors) {
			if (preProcessor.canPreProcess(node, currentContext)) {
				const record = preProcessor.preProcess(node, currentContext);
				if (record) {
					const handler = config.handlers.find(h => h.canHandle(record)) ?? null;
					return { record, handler, shouldVisit: false };
				}
			}
		}
		return null;
	}

	function maybeHandleFactory(node: Node): HandleResult | null {
		if (node.type === 'root') return null;

		const factory = getFactory(node, currentContext, config.factories);
		if (!factory) return null;

		const record = factory.create(node, currentContext);
		const handler = config.handlers.find(h => h.canHandle(record)) ?? null;

		return { record, handler, shouldVisit: factory.shouldVisit };
	}

	function handleNaturalBlock(node: Node): typeof SKIP | undefined {
		const record = createNaturalBlock(node as Nodes, currentContext);
		if (record.position) flushGap(record.position.start, lastEnd, markdown, currentContext);
		currentContext.push(record);
		if (record.position) {
			updateLastEnd(record.position.end);
		}
		return node.type === 'paragraph' ? undefined : SKIP;
	}

	function visitNode(node: Node): typeof SKIP | undefined {
		if (node.type === 'root') return undefined;

		const preResult = tryPreProcessors(node);
		if (preResult) {
			const { record, handler } = preResult;

			if (record.position) flushGap(record.position.start, lastEnd, markdown, currentContext);

			if (handler) {
				currentContext = handler.handle(record, node, currentContext);
			} else {
				currentContext.push(record as BlockContent);
			}

			if (record.position) {
				updateLastEnd(record.position.end);
			}

			return SKIP;
		}

		const factoryResult = maybeHandleFactory(node);
		if (factoryResult) {
			const { record, handler, shouldVisit } = factoryResult;

			if (record.position) flushGap(record.position.start, lastEnd, markdown, currentContext);

			if (handler) {
				currentContext = handler.handle(record, node, currentContext);
			} else {
				currentContext.push(record as BlockContent);
			}

			if (record.position) {
				updateLastEnd(record.position.end);
			}

			return shouldVisit ? undefined : SKIP;
		}

		if (isBlockType(node.type)) {
			return handleNaturalBlock(node);
		}

		return SKIP;
	}

	visit(tree, (n: Node) => visitNode(n));

	return { construct: 'Document', children: docContext.target() };
}
