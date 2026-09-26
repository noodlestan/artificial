import { createMemo, createSignal, For, Show } from 'solid-js';
import CodeDemo from '../../demos/code/CodeDemo';
import type { DemoSource } from '../../demos/code/sources';
import styles from './CodecDemo.module.css';

export default function CodecDemo(props: { sources: DemoSource[] }) {
	const [selectedId, setSelectedId] = createSignal(props.sources[0]?.id);

	const selected = createMemo<DemoSource | undefined>(() => {
		return props.sources.find(source => source.id === selectedId()) ?? props.sources[0];
	});

	return (
		<Show
			when={props.sources.length > 0}
			fallback={<p class={styles['noSources']}>No demos are available.</p>}
		>
			<div class={styles['CodecDemo']}>
				<select
					aria-label="Demo"
					class={styles['select']}
					onChange={event => setSelectedId(event.currentTarget.value)}
				>
					<For each={props.sources}>
						{source => <option value={source.id}>{source.title}</option>}
					</For>
				</select>
				<Show when={selected()}>
					{source => (
						<div class={styles['info']}>
							<h2 class={styles['title']}>Example: {source().title}</h2>
							<p class={styles['description']}>{source().description}</p>
						</div>
					)}
				</Show>
				<CodeDemo markdown={selected()?.markdown ?? ''} />
			</div>
		</Show>
	);
}
