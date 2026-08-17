import { type ArtDocument } from '@art-js/artificial-constructs';

import { buildDocument } from './builder';
import { createDefaultConfig } from './config/createDefaultConfig';

// Local exports
export { isBlockType } from './constants';
export { createDefaultConfig } from './config';

export function parse(markdown?: string): ArtDocument {
	const config = createDefaultConfig();
	return buildDocument(config, markdown ?? '');
}
