import type { VisitContext } from '@art-js/artificial-primitives';
import type { Strong } from 'mdast';

import { rawSlice } from '../../../helpers/rawSlice';

export function stripStrong(node: Strong, context: VisitContext): string {
	const raw = rawSlice(node, context);
	return raw.length >= 4 &&
		((raw.startsWith('**') && raw.endsWith('**')) || (raw.startsWith('__') && raw.endsWith('__')))
		? raw.slice(2, -2)
		: raw;
}
