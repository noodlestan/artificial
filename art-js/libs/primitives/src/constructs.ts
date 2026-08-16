import type { RecordBase } from './record.js';
import type { BlockContent } from './registry.js';

/** Tag — a projection tag `(#identifier)`. */
export interface Tag extends RecordBase {
	construct: 'Tag';
	/** Kebab-case tag name, without `#` or parentheses. */
	name: string;
}

/** SectionBlock — a resource declaration `# Kind: Name` plus its content. */
export interface SectionBlock extends RecordBase {
	construct: 'SectionBlock';
	/** Declared resource kind (e.g. 'Routine'); absent for kindless headings. */
	kind?: string;
	/** Declared resource name (e.g. 'List Tasks'). */
	name: string;
	/** Projection tags attached to the heading. */
	tags?: Tag[];
	/** Ordered block-level content, including FieldBlock records in source order. */
	children: BlockContent[];
	/** Heading depth (1–6), tracked for section nesting. */
	depth?: number;
}

/** FieldBlock — a named property `**Name:**` within a SectionBlock. */
export interface FieldBlock extends RecordBase {
	construct: 'FieldBlock';
	name: string;
	/** Block-level value: everything until the next terminator. */
	value: BlockContent[];
}

/** NaturalBlock — the catch-all: plain markdown not classified as art. */
export interface NaturalBlock extends RecordBase {
	construct: 'NaturalBlock';
	/** Raw markdown content (always present, lossless round-trip). */
	value: string;
	/** Parsed sub-records when the content is structured (e.g. list items). */
	children?: BlockContent[];
	/** mdast node type (e.g. 'paragraph', 'code', 'list', 'table'). */
	type?: string;
	/** Code language (for code blocks). */
	lang?: string | null;
	/** Code metadata (for code blocks). */
	meta?: string | null;
	/** Allow any other mdast attributes to pass through. */
	[key: string]: unknown;
}

/** Document — the parse result for one source file. */
export interface Document extends RecordBase {
	construct: 'Document';
	children: BlockContent[];
}
