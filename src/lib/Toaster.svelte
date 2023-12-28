<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Position } from './types.js';
	import { toastState } from './state.js';
	import Toast from './Toast.svelte';

	// Visible toasts amount
	const VISIBLE_TOASTS_AMOUNT = 3;

	// Viewport padding
	const VIEWPORT_OFFSET = '32px';

	// Default toast width
	const TOAST_WIDTH = 356;

	// Default gap between toasts
	const GAP = 14;

	interface ToastOptions {
		class?: string;
		descriptionClass?: string;
		style?: string;
		cancelButtonStyle?: string;
		actionButtonStyle?: string;
	}

	// TODO: move to mode watcher for SSR theme
	function getInitialTheme(t: string) {
		if (t !== 'system') {
			return t;
		}

		if (typeof window !== 'undefined') {
			if (
				window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
			) {
				return 'dark';
			}

			return 'light';
		}

		return 'light';
	}

	export let invert = false;
	export let theme: 'light' | 'dark' | 'system' = 'light';
	export let position: Position = 'bottom-right';
	export let hotkey: string[] = ['altKey', 'KeyT'];
	export let richColors = false;
	export let expand = false;
	export let duration: number | null = null;
	export let visibleToasts: number = VISIBLE_TOASTS_AMOUNT;
	export let closeButton = false;
	export let toastOptions: ToastOptions = {};
	export let offset: string | number | null = null;

	const { toasts, heights } = toastState;

	$: possiblePositions = Array.from(
		new Set(
			[
				position,
				...$toasts
					.filter((toast) => toast.position)
					.map((toast) => toast.position)
			].filter(Boolean)
		)
	) as Position[];

	let expanded = false;
	let interacting = false;
	let actualTheme = getInitialTheme(theme);
	let listRef: HTMLOListElement;
	$: hotkeyLabel = hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '');
	let lastFocusedElementRef: HTMLElement | null = null;
	let isFocusWithinRef = false;

	$: if ($toasts.length <= 1) {
		expanded = false;
	}

	onDestroy(() => {
		if (listRef && lastFocusedElementRef) {
			lastFocusedElementRef.focus({ preventScroll: true });
			lastFocusedElementRef = null;
			isFocusWithinRef = false;
		}
	});

	onMount(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			const isHotkeyPressed = hotkey.every(
				(key) =>
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(event as any)[key] || event.code === key
			);

			if (isHotkeyPressed) {
				expanded = true;
				console.log('hotkeypressed');
				listRef?.focus();
			}

			if (
				event.code === 'Escape' &&
				(document.activeElement === listRef ||
					listRef?.contains(document.activeElement))
			) {
				expanded = false;
			}
		};

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	$: {
		if (theme !== 'system') {
			actualTheme = theme;
		}

		if (typeof window !== 'undefined') {
			if (theme === 'system') {
				// check if current preference is dark
				if (
					window.matchMedia &&
					window.matchMedia('(prefers-color-scheme: dark)').matches
				) {
					// it's currently dark
					actualTheme = 'dark';
				} else {
					// it's not dark
					actualTheme = 'light';
				}
			}

			window
				.matchMedia('(prefers-color-scheme: dark)')
				.addEventListener('change', ({ matches }) => {
					actualTheme = matches ? 'dark' : 'light';
				});
		}
	}

	type OListFocusEvent = FocusEvent & {
		currentTarget: EventTarget & HTMLOListElement;
	};

	function handleBlur(event: OListFocusEvent) {
		if (
			isFocusWithinRef &&
			!event.currentTarget.contains(event.relatedTarget as HTMLElement)
		) {
			isFocusWithinRef = false;
			if (lastFocusedElementRef) {
				lastFocusedElementRef.focus({ preventScroll: true });
				lastFocusedElementRef = null;
			}
		}
	}

	function handleFocus(event: OListFocusEvent) {
		if (!isFocusWithinRef) {
			isFocusWithinRef = true;
			lastFocusedElementRef = event.relatedTarget as HTMLElement;
		}
	}
</script>

{#if $toasts.length > 0}
	<section aria-label={`Notifications ${hotkeyLabel}`} tabIndex={-1}>
		{#each possiblePositions as position, index}
			<ol
				tabIndex={-1}
				bind:this={listRef}
				class={$$props.class}
				data-sonner-toaster
				data-theme={actualTheme}
				data-rich-colors={richColors}
				data-y-position={position.split('-')[0]}
				data-x-position={position.split('-')[1]}
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:mouseenter={() => (expanded = true)}
				on:mousemove={() => (expanded = true)}
				on:mouseleave={() => {
					if (!interacting) {
						expanded = false;
					}
				}}
				on:pointerdown={() => (interacting = true)}
				on:pointerup={() => (interacting = false)}
				style:--front-toast-height={`${$heights[0]?.height}px`}
				style:--offset={typeof offset === 'number'
					? `${offset}px`
					: offset || VIEWPORT_OFFSET}
				style:--width={`${TOAST_WIDTH}px`}
				style:--gap={`${GAP}px`}
				style={$$props.style}
			>
				{#each $toasts.filter((toast) => (!toast.position && index === 0) || toast.position === position) as toast, index (toast.id)}
					<Toast
						{index}
						{toast}
						{duration}
						class={toastOptions?.class}
						descriptionClass={toastOptions?.descriptionClass}
						invert={Boolean(invert)}
						{visibleToasts}
						closeButton={Boolean(closeButton)}
						{interacting}
						{position}
						style={toastOptions?.style ?? ''}
						cancelButtonStyle={toastOptions?.cancelButtonStyle}
						actionButtonStyle={toastOptions?.actionButtonStyle}
						{toasts}
						{heights}
						expandByDefault={Boolean(expand)}
						{expanded}
					/>
				{/each}
			</ol>
		{/each}
	</section>
{/if}
