<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { ToastClassnames, ToastProps } from './types';
	import { toastState } from './toast-state.svelte.js';
	import { cn } from './internal/helpers.js';

	let {
		toast,
		index,
		expanded,
		invert,
		position,
		visibleToasts,
		expandByDefault,
		closeButton,
		interacting,
		cancelButtonStyle = '',
		actionButtonStyle = '',
		duration,
		descriptionClass = '',
		classes,
		unstyled = false
	}: ToastProps = $props();
</script>
