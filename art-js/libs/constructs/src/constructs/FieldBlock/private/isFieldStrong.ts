import type { VisitContext } from '@art-js/artificial-primitives';
import type { Node, Strong } from 'mdast';

import { FIELD_TEXT_PATTERN } from './constants';
import { stripStrong } from './stripStrong';

export function isFieldStrong(node: Node, context: VisitContext): node is Strong {
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
}
