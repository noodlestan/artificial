import type { Strong } from 'mdast';

import { rawSlice } from '../../../framework/rawSlice';
import type { MdastNode, VisitContext } from '../../../framework/types';
import { FIELD_TEXT_PATTERN } from '../constants';

function stripStrong(node: Strong, context: VisitContext): string {
	const raw = rawSlice(node, context);
	if (raw.length >= 4 && raw.startsWith('**') && raw.endsWith('**')) return raw.slice(2, -2);
	if (raw.length >= 4 && raw.startsWith('__') && raw.endsWith('__')) return raw.slice(2, -2);
	return raw;
}

export function isFieldStrong(node: MdastNode, context: VisitContext): node is Strong {
	return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
}

export { stripStrong };
