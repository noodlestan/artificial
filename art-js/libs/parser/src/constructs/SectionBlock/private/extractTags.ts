import type { Tag } from '../../../types';
import { TAG_PATTERN_G } from '../constants';

export function extractTags(text: string): Tag[] {
	const tags: Tag[] = [];
	for (const match of text.matchAll(TAG_PATTERN_G)) {
		const name = match[1] ?? '';
		if (name) tags.push({ construct: 'Tag', name });
	}
	return tags;
}
