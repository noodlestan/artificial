import type { MdastNode, VisitContext } from '@art-js/artificial-primitives';
import type { Strong } from 'mdast';

import { FIELD_TEXT_PATTERN } from './constants';
import { stripStrong } from './stripStrong';

export function isFieldStrong(node: MdastNode, context: VisitContext): node is Strong {
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node, context));
}
