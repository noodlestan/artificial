import { createEffect, createMemo, createSignal } from 'solid-js';
import { createArtCodec } from '@art-md/codec';
import DemoPane from './private/DemoPane';
import TextArea from './private/TextArea';
import styles from './CodeDemo.module.css';

const codec = createArtCodec();

type CodeDemoProps = {
	markdown: string;
};

export default function CodeDemo(props: CodeDemoProps) {
	const [draft, setDraft] = createSignal(props.markdown);

	createEffect(() => {
		setDraft(props.markdown);
	});

	const output = createMemo(() => {
		try {
			const { document } = codec.parse(draft());
			return JSON.stringify(document, null, 2);
		} catch (error) {
			return `Parse error: ${error instanceof Error ? error.message : String(error)}`;
		}
	});

	return (
		<div class={styles['CodeDemo']}>
			<DemoPane title="Art MD">
				<TextArea ariaLabel="Art MD source" onInput={setDraft} rows={20} value={draft()} />
			</DemoPane>
			<DemoPane title="ArtDocument (Art AST)">
				<TextArea ariaLabel="Parsed Art MD document" readonly rows={20} value={output()} />
			</DemoPane>
		</div>
	);
}
