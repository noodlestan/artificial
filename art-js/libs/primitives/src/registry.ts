import type { FieldBlock, NaturalBlock, SectionBlock, Tag } from './constructs.js';

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
