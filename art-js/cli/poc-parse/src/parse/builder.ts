import type { Nodes, Paragraph } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Node } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

import {
	createDocumentContext,
	createFieldBlockFromParagraph,
	createFieldBlockHandler,
	createNaturalBlock,
	createNestedContext,
	createSectionBlockHandler,
	getFactory,
	isInlineNode,
} from './factory';
import type { ConstructHandler, VisitContext } from './factory';
import type { Document, NaturalBlock, Point } from './types';

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

	function visitParagraph(node: Paragraph): typeof SKIP | undefined {
		if (node.children.length > 0 && node.children[0].type === 'strong') {
			const strongNode = node.children[0];
			const raw =
				strongNode.position?.start && strongNode.position?.end
					? markdown.slice(strongNode.position.start.offset, strongNode.position.end.offset)
					: '';
			const inner =
				raw.length >= 4 && raw.startsWith('**') && raw.endsWith('**')
					? raw.slice(2, -2)
					: raw.length >= 4 && raw.startsWith('__') && raw.endsWith('__')
						? raw.slice(2, -2)
						: raw;
			const fieldPattern = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;

			if (fieldPattern.test(inner)) {
				const record = createFieldBlockFromParagraph(node, currentContext);

				if (record.position) flushGap(record.position.start);

				if (currentContext.capturing() === 'FieldBlock') {
					const parent = currentContext.parent();
					if (parent) {
						parent.lastEnd = currentContext.lastEnd;
						currentContext = parent;
					}
				}

				currentContext.push(record);
				const newCtx = createNestedContext('FieldBlock', currentContext, undefined, record.value);
				newCtx.lastEnd = currentContext.lastEnd;
				currentContext = newCtx;

				if (record.position) {
					updateLastEnd(record.position.end);
				}

				return SKIP;
			}
		}

		const record = createNaturalBlock(node as Nodes, currentContext);
		if (record.position) flushGap(record.position.start);
		currentContext.push(record);
		if (record.position) {
			updateLastEnd(record.position.end);
		}

		return undefined;
	}

	function visitNode(node: Node): typeof SKIP | undefined {
		if (node.type === 'root') return undefined;

		if (node.type === 'paragraph') {
			return visitParagraph(node as unknown as Paragraph);
		}

		const factory = getFactory(node, currentContext);

		if (factory) {
			const record = factory.create(node, currentContext);

			if (record.position) flushGap(record.position.start);

			const handler = handlers.find(h => h.canHandle(record));
			if (handler) {
				currentContext = handler.handle(record, node, currentContext);
			} else {
				currentContext.push(record);
			}

			if (record.position) {
				updateLastEnd(record.position.end);
			}

			return factory.visitChildren ? undefined : SKIP;
		}

		if (isInlineNode(node)) return SKIP;

		const record = createNaturalBlock(node, currentContext);
		if (record.position) flushGap(record.position.start);
		currentContext.push(record);
		if (record.position) {
			updateLastEnd(record.position.end);
		}

		return SKIP;
	}

	visit(tree, (n: Node) => visitNode(n));

	return { construct: 'Document', children: docContext.target() };
}
