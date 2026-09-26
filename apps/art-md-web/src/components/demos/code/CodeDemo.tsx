import { createMemo, createSignal } from 'solid-js';
import { createArtCodec } from '@art-md/codec';
import styles from './CodeDemo.module.css';

const codec = createArtCodec();

const DEMO_MARKDOWN = `# Hello World

## Repository: Art MD

**Author:** Noodlestan Collective

**Remote:** \`git@github.com:noodlestan/art-md.git\`
`;

type TextAreaEvent = {
	currentTarget: HTMLTextAreaElement;
	target: HTMLTextAreaElement;
};

type SourceInputEvent = InputEvent & TextAreaEvent;

function describeError(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

export default function CodeDemo() {
	const [source, setSource] = createSignal(DEMO_MARKDOWN);

	const output = createMemo(() => {
		try {
			const { document } = codec.parse(source());
			return JSON.stringify(document, null, 2);
		} catch (error) {
			return `Parse error: ${describeError(error)}`;
		}
	});

	function handleSourceInput(event: SourceInputEvent) {
		setSource(event.currentTarget.value);
	}

	return (
		<div class={styles['CodeDemo']}>
			<div class={styles['CodeDemo--Pane']}>
				<h2>Art MD</h2>
				<textarea
					aria-label="Art MD source"
					onInput={handleSourceInput}
					rows={20}
					spellcheck={false}
					value={source()}
				/>
			</div>
			<div class={styles['CodeDemo--Pane']}>
				<h2>ArtDocument (Art AST)</h2>
				<textarea aria-label="Parsed Art MD document" readonly rows={20} value={output()} />
			</div>
		</div>
	);
}
