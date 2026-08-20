import type { ArtDocument } from '@art-js/artificial-constructs';
import type { Root } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';

import { artAstToMdast } from './artAstToMdast';
import { createDefaultSerializerConfig } from './config/createDefaultSerializerConfig';

export function serialize(document: ArtDocument): string {
	const config = createDefaultSerializerConfig();
	const root = artAstToMdast(config, document) as Root;
	return toMarkdown(root, { bullet: '-', emphasis: '_' });
}
