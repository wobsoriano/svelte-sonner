import { on } from 'svelte/events';

export function useDocumentHidden() {
	let current = $state(typeof document !== 'undefined' ? document.hidden : false);

	$effect(() => {
		return on(document, 'visibilitychange', () => {
			current = document.hidden;
		});
	});

	return {
		get current() {
			return current;
		}
	};
}
