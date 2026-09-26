import styles from './TextArea.module.css';

type TextAreaProps = {
	value: string;
	ariaLabel: string;
	rows?: number;
	readonly?: boolean;
	onInput?: (value: string) => void;
};

type SourceInputEvent = InputEvent & { currentTarget: HTMLTextAreaElement };

export default function TextArea(props: TextAreaProps) {
	function handleInput(event: SourceInputEvent) {
		props.onInput?.(event.currentTarget.value);
	}

	return (
		<textarea
			aria-label={props.ariaLabel}
			class={styles['TextArea']}
			onInput={handleInput}
			readonly={props.readonly ?? false}
			rows={props.rows ?? 20}
			spellcheck={false}
			value={props.value}
		/>
	);
}
