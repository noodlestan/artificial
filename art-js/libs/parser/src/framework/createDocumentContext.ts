import { createNestedContext } from './createNestedContext';
import type { VisitContext } from './types';

export function createDocumentContext(source: string): VisitContext {
	return createNestedContext('Document', undefined, source);
}
