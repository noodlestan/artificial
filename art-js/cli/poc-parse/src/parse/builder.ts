import type { Heading } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Node } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

import { cleanPosition, getFactory, naturalBlockFactory } from './factory';
import type { ConstructFactory, VisitContext } from './factory';
import type {
	BlockContent,
	Construct,
	Document,
	FieldBlock,
	NaturalBlock,
	Point,
	SectionBlock,
} from './types';

/**
 * Turns markdown into schema-typed records by parsing to mdast and mapping each
 * node to a construct through the factory pattern (see factory.ts).
 *
 * Known constructs (SectionBlock, FieldBlock, Tag) get a record from their
 * factory; everything else falls back to a NaturalBlock. Blank-line gaps
 * between records are preserved as NaturalBlocks (EC5).
 */
export function buildDocument(markdown: string): Document {
	const tree = fromMarkdown(markdown);
	const document: Document = { construct: 'Document', children: [] };
	const sectionStack: SectionBlock[] = [];
	const sectionLevels: number[] = [];
	const fieldStack: FieldBlock[] = [];
	const context: VisitContext = {
		sectionStack,
		documentChildren: document.children,
		source: markdown,
	};
	let lastEnd: Point | undefined;

	const currentChildren = (): BlockContent[] => {
		const field = fieldStack[fieldStack.length - 1];
		if (field) return field.value;
		const section = sectionStack[sectionStack.length - 1];
		if (section) return section.children;
		return document.children;
	};

	/** Emits a NaturalBlock for any source gap up to `start`, then records it. */
	const flushGap = (start: Point): void => {
		if (lastEnd && start.offset > lastEnd.offset) {
			const gap = markdown.slice(lastEnd.offset, start.offset);
			if (gap) {
				const gapBlock: NaturalBlock = {
					construct: 'NaturalBlock',
					value: gap,
					position: cleanPosition({ start: lastEnd, end: start }),
				};
				currentChildren().push(gapBlock);
			}
		}
		lastEnd = { line: start.line, column: start.column, offset: start.offset };
	};

	/** Pushes a record into the current field value, section, or document. */
	const pushRecord = (record: Construct): void => {
		if (record.construct === 'Tag') {
			const section = sectionStack[sectionStack.length - 1];
			if (section) (section.tags ??= []).push(record);
			return;
		}
		currentChildren().push(record);
	};

	const closeField = (): void => {
		fieldStack.pop();
	};

	const closeSections = (minLevel: number): void => {
		while (sectionLevels.length > 0 && sectionLevels[sectionLevels.length - 1] >= minLevel) {
			sectionLevels.pop();
			const section = sectionStack.pop() as SectionBlock;
			const parent = sectionStack[sectionStack.length - 1];
			if (parent) parent.children.push(section);
			else document.children.push(section);
		}
	};

	visit(tree, (node: Node) => {
		if (node.type === 'root') return undefined;
		const factory: ConstructFactory | null = getFactory(node, context);
		if (factory) {
			const record = factory.create(node, context);
			if (record.position) flushGap(record.position.start);
			if (record.construct === 'SectionBlock') {
				const heading = node as Heading;
				closeField();
				closeSections(heading.depth);
				sectionStack.push(record);
				sectionLevels.push(heading.depth);
			} else if (record.construct === 'FieldBlock') {
				closeField();
				pushRecord(record);
				fieldStack.push(record);
			} else {
				pushRecord(record);
			}
			if (record.position) {
				lastEnd = {
					line: record.position.end.line,
					column: record.position.end.column,
					offset: record.position.end.offset,
				};
			}
			return factory.visitChildren ? undefined : SKIP;
		}
		if (node.type === 'paragraph') return undefined;
		const record = naturalBlockFactory.create(node, context);
		if (record.position) flushGap(record.position.start);
		pushRecord(record);
		if (record.position) {
			lastEnd = {
				line: record.position.end.line,
				column: record.position.end.column,
				offset: record.position.end.offset,
			};
		}
		return SKIP;
	});

	closeField();
	closeSections(0);

	return document;
}
