import { children, type ParentProps } from 'solid-js';
import styles from './DemoPane.module.css';

type DemoPaneProps = ParentProps<{
	title: string;
}>;

export default function DemoPane(props: DemoPaneProps) {
	const content = children(() => props.children);

	return (
		<div class={styles['DemoPane']}>
			<h2>{props.title}</h2>
			{content()}
		</div>
	);
}
