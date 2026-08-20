import type { FieldBlock } from './constructs/FieldBlock/private/types';
import type { FieldInline } from './constructs/FieldInline/private/types';
import type { NaturalBlock } from './constructs/NaturalBlock/private/types';
import type { NaturalExpression } from './constructs/NaturalExpression/private/types';
import type { SectionBlock } from './constructs/SectionBlock/private/types';
import type { Tag } from './constructs/Tag/private/types';

/** Open registry of block-level constructs. Augment via declaration merging when new constructs land. */
export interface BlockConstructMap {
	SectionBlock: SectionBlock;
	FieldBlock: FieldBlock;
	FieldInline: FieldInline;
	NaturalBlock: NaturalBlock;
}

/** Open registry of inline/expression-level constructs. */
export interface InlineConstructMap {
	NaturalExpression: NaturalExpression;
	Tag: Tag;
}

/** Open registry of all constructs. */
export interface ConstructMap extends BlockConstructMap, InlineConstructMap {}

export type BlockContent = BlockConstructMap[keyof BlockConstructMap];
export type InlineContent = InlineConstructMap[keyof InlineConstructMap];

export type Construct = ConstructMap[keyof ConstructMap];
