import type { Nodes, Paragraph } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Node } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

import {
	createDocumentContext,
	createFieldBlockHandler,
	createNaturalBlock,
	createNestedContext,
	createSectionBlockHandler,
	getFactory,
	isInlineNode,
} from './factory';
import type { ConstructHandler, VisitContext } from './factory';
import type { Construct, Document, NaturalBlock, Point } from './types';

interface HandleResult {
	record: Construct;
	handler: ConstructHandler | null;
	shouldVisit: boolean;
}

export function buildDocument(
	markdown: string,
	handlers: ConstructHandler[] = [
		createSectionBlockHandler(createNestedContext),
		createFieldBlockHandler(createNestedContext),
	],
): Document {
	const tree = fromMarkdown(markdown);
	const docContext = createDocumentContext(markdown);
	let currentContext: VisitContext = docContext;
	let lastEnd: Point | undefined;

	function updateLastEnd(end: Point): void {
		lastEnd = { line: end.line, column: end.column, offset: end.offset };
		currentContext.lastEnd = lastEnd;
	}

	function flushGap(start: Point): void {
		if (lastEnd && start.offset > lastEnd.offset) {
			const gap = markdown.slice(lastEnd.offset, start.offset);
			if (gap) {
				const gapBlock: NaturalBlock = {
					construct: 'NaturalBlock',
					type: 'text',
					value: gap,
				};
				currentContext.push(gapBlock);
			}
		}
	}

	function maybeHandleFactory(node: Node): HandleResult | null {
		// Skip root node
		if (node.type === 'root') return null;

		// Try to find a factory for this node
		const factory = getFactory(node, currentContext);
		if (!factory) return null;

		// Create the record
		const record = factory.create(node, currentContext);

		// Find a handler for this record
		const handler = handlers.find(h => h.canHandle(record)) ?? null;

		return { record, handler, shouldVisit: factory.shouldVisit };
	}

	/** Handle block nodes — field detection or natural block fallback. */
	function handleBlock(node: Paragraph): typeof SKIP | undefined {
		// Try field detection via context
		const fieldRecord = currentContext.detectField(node);
		if (fieldRecord) {
			if (fieldRecord.position) flushGap(fieldRecord.position.start);

			if (currentContext.capturing() === 'FieldBlock') {
				const parent = currentContext.parent();
				if (parent) {
					parent.lastEnd = currentContext.lastEnd;
					currentContext = parent;
				}
			}

			currentContext.push(fieldRecord);
			const newCtx = createNestedContext(
				'FieldBlock',
				currentContext,
				undefined,
				fieldRecord.value,
			);
			newCtx.lastEnd = currentContext.lastEnd;
			currentContext = newCtx;

			if (fieldRecord.position) {
				updateLastEnd(fieldRecord.position.end);
			}

			return SKIP;
		}

		// Otherwise, treat as NaturalBlock
		const record = createNaturalBlock(node as Nodes, currentContext);
		if (record.position) flushGap(record.position.start);
		currentContext.push(record);
		if (record.position) {
			updateLastEnd(record.position.end);
		}

		// Return undefined (not SKIP) to visit children for tag detection
		return undefined;
	}

	function handleNaturalBlock(node: Node): typeof SKIP {
		const record = createNaturalBlock(node, currentContext);
		if (record.position) flushGap(record.position.start);
		currentContext.push(record);
		if (record.position) {
			updateLastEnd(record.position.end);
		}
		return SKIP;
	}

	function visitNode(node: Node): typeof SKIP | undefined {
		if (node.type === 'root') return undefined;

		// Handle paragraph specially (field detection + natural block)
		if (node.type === 'paragraph') {
			return handleBlock(node as unknown as Paragraph);
		}

		// Try factory handling
		const result = maybeHandleFactory(node);
		if (result) {
			const { record, handler, shouldVisit } = result;

			if (record.position) flushGap(record.position.start);

			if (handler) {
				currentContext = handler.handle(record, node, currentContext);
			} else {
				currentContext.push(record);
			}

			if (record.position) {
				updateLastEnd(record.position.end);
			}

			return shouldVisit ? undefined : SKIP;
		}

		// Inline nodes (text, emphasis, strong, etc.) are NOT visited further.
		// We only want to visit block-level nodes for construct classification.
		// Inline content is captured as part of NaturalBlock.value (raw markdown).
		if (isInlineNode(node)) return SKIP;

		// Handle natural block fallback
		return handleNaturalBlock(node);
	}

	visit(tree, (n: Node) => visitNode(n));

	return { construct: 'Document', children: docContext.target() };
}
