import type { Tag } from '../../../types';
import { TAG_PATTERN_G } from '../constants';

export function extractTags(text: string): Tag[] {
	const tags: Tag[] = [];
	for (const match of text.matchAll(TAG_PATTERN_G)) {
		tags.push({ construct: 'Tag', name: match[1] });
	}
	return tags;
}
