/** A point in the source. */
export interface Point {
	line: number;
	column: number;
	offset: number;
}

/** The source span of a record. */
export interface Position {
	start: Point;
	end: Point;
}

/** Base interface implemented by every construct record. */
export interface RecordBase {
	/** Discriminator — the construct class (e.g. 'SectionBlock'). */
	construct: string;
	/** Source position, carried from the token stream. */
	position?: Position;
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

/** Tag — a projection tag `(#identifier)`. */
export interface Tag extends RecordBase {
	construct: 'Tag';
	/** Kebab-case tag name, without `#` or parentheses. */
	name: string;
}

/** Document — the parse result for one source file. */
export interface Document extends RecordBase {
	construct: 'Document';
	children: BlockContent[];
}

/** Open registry of block-level constructs. Augment via declaration merging when new constructs land. */
export interface BlockConstructMap {
	SectionBlock: SectionBlock;
	FieldBlock: FieldBlock;
	NaturalBlock: NaturalBlock;
}

/** Open registry of inline/expression-level constructs. */
export interface InlineConstructMap {
	Tag: Tag;
}

/** Open registry of all constructs. */
export interface ConstructMap extends BlockConstructMap, InlineConstructMap {}

export type BlockContent = BlockConstructMap[keyof BlockConstructMap];
export type InlineContent = InlineConstructMap[keyof InlineConstructMap];
export type Construct = ConstructMap[keyof ConstructMap];
