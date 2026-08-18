import type { ArtDocument, ConstructToMdast } from '@art-js/artificial-constructs';
import type { Node } from 'mdast';

import type { SerializerConfig } from './config/types';

export function artAstToMdast(config: SerializerConfig, document: ArtDocument): Node {
	const registry = new Map<string, ConstructToMdast>();
	for (const factory of config.constructs) {
		const impl = factory();
		registry.set(impl.construct, impl);
	}

	function visit(node: { construct: string; children?: unknown[]; value?: unknown }): Node[] {
		const rawChildren =
			'children' in node && Array.isArray(node.children)
				? node.children
				: 'value' in node && Array.isArray(node.value)
					? node.value
					: [];

		const childNodes: Node[] = rawChildren
			.filter(
				(c): c is { construct: string; children?: unknown[]; value?: unknown } =>
					typeof c === 'object' && c !== null && 'construct' in c,
			)
			.flatMap(visit);

		const impl = registry.get(node.construct);
		if (!impl) {
			throw new Error(`Unknown construct: ${node.construct}`);
		}
		const mainNode = impl.toMdast(node as never, childNodes);

		// For block constructs with children (SectionBlock), return the main node
		// followed by the children as siblings — they are not nested inside the heading.
		if (
			'children' in node &&
			Array.isArray(node.children) &&
			node.children.length > 0 &&
			node.construct !== 'Document'
		) {
			return [mainNode, ...childNodes];
		}

		return [mainNode];
	}

	const mdastChildren = document.children.flatMap(child =>
		visit(child as { construct: string; children?: unknown[]; value?: unknown }),
	);
	return { type: 'root', children: mdastChildren } as Node;
}
