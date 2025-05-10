<script lang="ts" module>
	// visible toasts amount
	const VISIBLE_TOASTS_AMOUNT = 3;

	// Viewport padding
	const VIEWPORT_OFFSET = '24px';

	// Mobile viewport padding
	const MOBILE_VIEWPORT_OFFSET = '16px';

	// Default lifetime of a toasts (in ms)
	const TOAST_LIFETIME = 4000;

	// Default toast width
	const TOAST_WIDTH = 356;

	// Default gap between toasts
	const GAP = 14;

	const DARK = 'dark';
	const LIGHT = 'light';

	type OffsetObject = {
		'--offset-top': string;
		'--offset-right': string;
		'--offset-bottom': string;
		'--offset-left': string;
		'--mobile-offset-top': string;
		'--mobile-offset-right': string;
		'--mobile-offset-bottom': string;
		'--mobile-offset-left': string;
	};

	function getOffsetObject(
		defaultOffset: ToasterProps['offset'],
		mobileOffset: ToasterProps['mobileOffset']
	) {
		const styles = {} as OffsetObject;

		[defaultOffset, mobileOffset].forEach((offset, index) => {
			const isMobile = index === 1;
			const prefix = isMobile ? '--mobile-offset' : '--offset';
			const defaultValue = isMobile
				? MOBILE_VIEWPORT_OFFSET
				: VIEWPORT_OFFSET;

			function assignAll(offset: string | number) {
				['top', 'right', 'bottom', 'left'].forEach((key) => {
					styles[`${prefix}-${key}` as keyof OffsetObject] =
						typeof offset === 'number' ? `${offset}px` : offset;
				});
			}

			if (typeof offset === 'number' || typeof offset === 'string') {
				assignAll(offset);
			} else if (typeof offset === 'object') {
				['top', 'right', 'bottom', 'left'].forEach((key) => {
					const value = offset[key as keyof typeof offset];
					if (value === undefined) {
						styles[`${prefix}-${key}` as keyof OffsetObject] =
							defaultValue;
					} else {
						styles[`${prefix}-${key}` as keyof OffsetObject] =
							typeof value === 'number' ? `${value}px` : value;
					}
				});
			} else {
				assignAll(defaultValue);
			}
		});

		return styles;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { toastState } from './toast-state.svelte';
	import Toast from './Toast.svelte';
	import Loader from './Loader.svelte';
	import type { ToastToDismiss, ToasterProps } from './types.js';
	import type { Position } from './types.js';
	import type {
		DragEventHandler,
		FocusEventHandler,
		MouseEventHandler,
		PointerEventHandler
	} from 'svelte/elements';
	import SuccessIcon from './icons/SuccessIcon.svelte';
	import ErrorIcon from './icons/ErrorIcon.svelte';
	import WarningIcon from './icons/WarningIcon.svelte';
	import InfoIcon from './icons/InfoIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	function getInitialTheme(t: string) {
		if (t !== 'system') return t;
		if (typeof window !== 'undefined') {
			if (
				window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
			) {
				return DARK;
			}

			return LIGHT;
		}

		return LIGHT;
	}

	function getDocumentDirection(): ToasterProps['dir'] {
		if (typeof window === 'undefined') return 'ltr';
		if (typeof document === 'undefined') return 'ltr'; // For Fresh purpose

		const dirAttribute = document.documentElement.getAttribute('dir');

		if (dirAttribute === 'auto' || !dirAttribute) {
			return window.getComputedStyle(document.documentElement)
				.direction as ToasterProps['dir'];
		}

		return dirAttribute as ToasterProps['dir'];
	}

	let {
		invert = false,
		position = 'bottom-right',
		hotkey = ['altKey', 'KeyT'],
		expand = false,
		closeButton = false,
		offset = VIEWPORT_OFFSET,
		mobileOffset = MOBILE_VIEWPORT_OFFSET,
		theme = 'light',
		richColors = false,
		duration = TOAST_LIFETIME,
		visibleToasts = VISIBLE_TOASTS_AMOUNT,
		toastOptions = {},
		dir = getDocumentDirection(),
		gap = GAP,
		loadingIcon: loadingIconProp,
		successIcon: successIconProp,
		errorIcon: errorIconProp,
		warningIcon: warningIconProp,
		closeIcon: closeIconProp,
		infoIcon: infoIconProp,
		containerAriaLabel = 'Notifications',
		class: className,
		closeButtonAriaLabel = 'Close toast',
		...restProps
	}: ToasterProps = $props();

	const possiblePositions = $derived(
		Array.from(
			new Set(
				[
					position,
					...toastState.toasts
						.filter((toast) => toast.position)
						.map((toast) => toast.position)
				].filter(Boolean)
			)
		) as Position[]
	);

	let expanded = $state(false);
	let interacting = $state(false);
	let actualTheme = $state(getInitialTheme(theme));
	let listRef = $state<HTMLOListElement>();
	let lastFocusedElementRef = $state<HTMLElement | null>(null);
	let isFocusWithin = $state(false);

	const hotkeyLabel = $derived(
		hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '')
	);

	$effect(() => {
		if (toastState.toasts.length <= 1) {
			expanded = false;
		}
	});

	// Check for dismissed toasts and remove them. We need to do this to have dismiss animation.
	$effect(() => {
		const toastsToDismiss = toastState.toasts.filter(
			(toast) =>
				(toast as unknown as ToastToDismiss).dismiss && !toast.delete
		);

		if (toastsToDismiss.length > 0) {
			const updatedToasts = toastState.toasts.map((toast) => {
				const matchingToast = toastsToDismiss.find(
					(dismissToast) => dismissToast.id === toast.id
				);

				if (matchingToast) {
					return { ...toast, delete: true };
				}

				return toast;
			});
			toastState.toasts = updatedToasts;
		}
	});

	$effect(() => {
		return () => {
			if (listRef && lastFocusedElementRef) {
				lastFocusedElementRef.focus({ preventScroll: true });
				lastFocusedElementRef = null;
				isFocusWithin = false;
			}
		};
	});

	onMount(() => {
		toastState.reset();

		const handleKeydown = (event: KeyboardEvent) => {
			const isHotkeyPressed = hotkey.every(
				(key) =>
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(event as any)[key] || event.code === key
			);
			if (isHotkeyPressed) {
				expanded = true;
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

	$effect(() => {
		if (theme !== 'system') {
			actualTheme = theme;
		}

		if (typeof window !== 'undefined') {
			if (theme === 'system') {
				if (
					window.matchMedia &&
					window.matchMedia('(prefers-color-scheme: dark)').matches
				) {
					actualTheme = DARK;
				} else {
					actualTheme = LIGHT;
				}
			}

			const mediaQueryList = window.matchMedia(
				'(prefers-color-scheme: dark)'
			);

			const changeHandler = ({ matches }: MediaQueryListEvent) => {
				actualTheme = matches ? DARK : LIGHT;
			};

			if ('addEventListener' in mediaQueryList) {
				mediaQueryList.addEventListener('change', changeHandler);
			} else {
				// @ts-expect-error deprecated API
				mediaQueryList.addListener(changeHandler);
			}
		}
	});

	const handleBlur: FocusEventHandler<HTMLOListElement> = (event) => {
		if (
			isFocusWithin &&
			!event.currentTarget.contains(event.relatedTarget as HTMLElement)
		) {
			isFocusWithin = false;
			if (lastFocusedElementRef) {
				lastFocusedElementRef.focus({ preventScroll: true });
				lastFocusedElementRef = null;
			}
		}
	};

	const handleFocus: FocusEventHandler<HTMLOListElement> = (event) => {
		const isNotDismissable =
			event.target instanceof HTMLElement &&
			event.target.dataset.dismissable === 'false';

		if (isNotDismissable) return;

		if (!isFocusWithin) {
			isFocusWithin = true;
			lastFocusedElementRef = event.relatedTarget as HTMLElement;
		}
	};

	const handlePointerDown: PointerEventHandler<HTMLOListElement> = (
		event
	) => {
		const isNotDismissable =
			event.target instanceof HTMLElement &&
			event.target.dataset.dismissable === 'false';

		if (isNotDismissable) return;
		interacting = true;
	};

	const handleMouseEnter: MouseEventHandler<HTMLOListElement> = () => {
		expanded = true;
	};

	const handleMouseLeave: MouseEventHandler<HTMLOListElement> = () => {
		if (!interacting) {
			expanded = false;
		}
	};

	const handleMouseMove: MouseEventHandler<HTMLOListElement> = () => {
		expanded = true;
	};

	const handleDragEnd: DragEventHandler<HTMLOListElement> = () => {
		expanded = false;
	};

	const handlePointerUp: PointerEventHandler<HTMLOListElement> = () => {
		interacting = false;
	};
</script>

<section
	aria-label="{containerAriaLabel} {hotkeyLabel}"
	tabIndex={-1}
	aria-live="polite"
	aria-relevant="additions text"
	aria-atomic="false"
>
	{#if toastState.toasts.length > 0}
		{#each possiblePositions as position, index (position)}
			{@const [y, x] = position.split('-')}
			{@const isLifted =
				expanded && toastState.toasts.length > 1 && !expand}
			{@const offsetObject = getOffsetObject(offset, mobileOffset)}
			<!-- eslint-disable-next-line svelte/valid-compile -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ol
				tabindex={-1}
				dir={dir === 'auto' ? getDocumentDirection() : dir}
				bind:this={listRef}
				class={className}
				data-sonner-toaster
				data-sonner-theme={actualTheme}
				data-y-position={y}
				data-lifted={isLifted}
				data-x-position={x}
				style:--front-toast-height={`${toastState.heights[0]?.height}px`}
				style:--width={`${TOAST_WIDTH}px`}
				style:--gap={`${gap}px`}
				style:--offset-top={offsetObject['--offset-top']}
				style:--offset-right={offsetObject['--offset-right']}
				style:--offset-bottom={offsetObject['--offset-bottom']}
				style:--offset-left={offsetObject['--offset-left']}
				style:--mobile-offset-top={offsetObject['--mobile-offset-top']}
				style:--mobile-offset-right={offsetObject[
					'--mobile-offset-right'
				]}
				style:--mobile-offset-bottom={offsetObject[
					'--mobile-offset-bottom'
				]}
				style:--mobile-offset-left={offsetObject[
					'--mobile-offset-left'
				]}
				style={restProps.style}
				onblur={handleBlur}
				onfocus={handleFocus}
				onmouseenter={handleMouseEnter}
				onmousemove={handleMouseMove}
				onmouseleave={handleMouseLeave}
				ondragend={handleDragEnd}
				onpointerdown={handlePointerDown}
				onpointerup={handlePointerUp}
				{...restProps}
			>
				{#each toastState.toasts.filter((toast) => (!toast.position && index === 0) || toast.position === position) as toast, index (toast.id)}
					<Toast
						{index}
						{toast}
						defaultRichColors={richColors}
						duration={toastOptions?.duration ?? duration}
						class={toastOptions?.class ?? ''}
						descriptionClass={toastOptions?.descriptionClass || ''}
						{invert}
						{visibleToasts}
						{closeButton}
						{interacting}
						{position}
						style={toastOptions?.style ?? ''}
						classes={toastOptions.classes || {}}
						unstyled={toastOptions.unstyled ?? false}
						cancelButtonStyle={toastOptions?.cancelButtonStyle ??
							''}
						actionButtonStyle={toastOptions?.actionButtonStyle ??
							''}
						closeButtonAriaLabel={toastOptions?.closeButtonAriaLabel ??
							closeButtonAriaLabel}
						expandByDefault={expand}
						{expanded}
						loadingIcon={loadingIconProp}
					>
						{#snippet successIcon()}
							{#if successIconProp}
								{@render successIconProp?.()}
							{:else if successIconProp !== null}
								<SuccessIcon />
							{/if}
						{/snippet}

						{#snippet errorIcon()}
							{#if errorIconProp}
								{@render errorIconProp?.()}
							{:else if errorIconProp !== null}
								<ErrorIcon />
							{/if}
						{/snippet}

						{#snippet warningIcon()}
							{#if warningIconProp}
								{@render warningIconProp?.()}
							{:else if warningIconProp !== null}
								<WarningIcon />
							{/if}
						{/snippet}

						{#snippet infoIcon()}
							{#if infoIconProp}
								{@render infoIconProp?.()}
							{:else if infoIconProp !== null}
								<InfoIcon />
							{/if}
						{/snippet}

						{#snippet closeIcon()}
							{#if closeIconProp}
								{@render closeIconProp?.()}
							{:else if closeIconProp !== null}
								<CloseIcon />
							{/if}
						{/snippet}
					</Toast>
				{/each}
			</ol>
		{/each}
	{/if}
</section>

<style global lang="postcss">
	:where(html[dir='ltr']),
	:where([data-sonner-toaster][dir='ltr']) {
		--toast-icon-margin-start: -3px;
		--toast-icon-margin-end: 4px;
		--toast-svg-margin-start: -1px;
		--toast-svg-margin-end: 0px;
		--toast-button-margin-start: auto;
		--toast-button-margin-end: 0;
		--toast-close-button-start: 0;
		--toast-close-button-end: unset;
		--toast-close-button-transform: translate(-35%, -35%);
	}

	:where(html[dir='rtl']),
	:where([data-sonner-toaster][dir='rtl']) {
		--toast-icon-margin-start: 4px;
		--toast-icon-margin-end: -3px;
		--toast-svg-margin-start: 0px;
		--toast-svg-margin-end: -1px;
		--toast-button-margin-start: 0;
		--toast-button-margin-end: auto;
		--toast-close-button-start: unset;
		--toast-close-button-end: 0;
		--toast-close-button-transform: translate(35%, -35%);
	}

	:where([data-sonner-toaster]) {
		position: fixed;
		width: var(--width);
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			Segoe UI,
			Roboto,
			Helvetica Neue,
			Arial,
			Noto Sans,
			sans-serif,
			Apple Color Emoji,
			Segoe UI Emoji,
			Segoe UI Symbol,
			Noto Color Emoji;
		--gray1: hsl(0, 0%, 99%);
		--gray2: hsl(0, 0%, 97.3%);
		--gray3: hsl(0, 0%, 95.1%);
		--gray4: hsl(0, 0%, 93%);
		--gray5: hsl(0, 0%, 90.9%);
		--gray6: hsl(0, 0%, 88.7%);
		--gray7: hsl(0, 0%, 85.8%);
		--gray8: hsl(0, 0%, 78%);
		--gray9: hsl(0, 0%, 56.1%);
		--gray10: hsl(0, 0%, 52.3%);
		--gray11: hsl(0, 0%, 43.5%);
		--gray12: hsl(0, 0%, 9%);
		--border-radius: 8px;
		box-sizing: border-box;
		padding: 0;
		margin: 0;
		list-style: none;
		outline: none;
		z-index: 999999999;
		transition: transform 400ms ease;
	}

	:where([data-sonner-toaster][data-lifted='true']) {
		transform: translateY(-8px);
	}

	@media (hover: none) and (pointer: coarse) {
		[data-sonner-toaster][data-lifted='true'] {
			transform: none;
		}
	}

	:where([data-sonner-toaster][data-x-position='right']) {
		right: var(--offset-right);
	}

	:where([data-sonner-toaster][data-x-position='left']) {
		left: var(--offset-left);
	}

	:where([data-sonner-toaster][data-x-position='center']) {
		left: 50%;
		transform: translateX(-50%);
	}

	:where([data-sonner-toaster][data-y-position='top']) {
		top: var(--offset-top);
	}

	:where([data-sonner-toaster][data-y-position='bottom']) {
		bottom: var(--offset-bottom);
	}

	:where([data-sonner-toast]) {
		--y: translateY(100%);
		--lift-amount: calc(var(--lift) * var(--gap));
		z-index: var(--z-index);
		position: absolute;
		opacity: 0;
		transform: var(--y);
		touch-action: none;
		transition:
			transform 400ms,
			opacity 400ms,
			height 400ms,
			box-shadow 200ms;
		box-sizing: border-box;
		outline: none;
		overflow-wrap: anywhere;
	}

	:where([data-sonner-toast][data-styled='true']) {
		padding: 16px;
		background: var(--normal-bg);
		border: 1px solid var(--normal-border);
		color: var(--normal-text);
		border-radius: var(--border-radius);
		box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
		width: var(--width);
		font-size: 13px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	:where([data-sonner-toast]:focus-visible) {
		box-shadow:
			0px 4px 12px rgba(0, 0, 0, 0.1),
			0 0 0 2px rgba(0, 0, 0, 0.2);
	}

	:where([data-sonner-toast][data-y-position='top']) {
		top: 0;
		--y: translateY(-100%);
		--lift: 1;
		--lift-amount: calc(1 * var(--gap));
	}

	:where([data-sonner-toast][data-y-position='bottom']) {
		bottom: 0;
		--y: translateY(100%);
		--lift: -1;
		--lift-amount: calc(var(--lift) * var(--gap));
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-description]) {
		font-weight: 400;
		line-height: 1.4;
		color: #3f3f3f;
	}

	:where([data-rich-colors='true'][data-sonner-toast][data-styled='true'])
		:where([data-description]) {
		color: inherit;
	}

	:where([data-sonner-toaster][data-sonner-theme='dark'])
		:where([data-description]) {
		color: hsl(0, 0%, 91%);
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-title]) {
		font-weight: 500;
		line-height: 1.5;
		color: inherit;
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-icon]) {
		display: flex;
		height: 16px;
		width: 16px;
		position: relative;
		justify-content: flex-start;
		align-items: center;
		flex-shrink: 0;
		margin-left: var(--toast-icon-margin-start);
		margin-right: var(--toast-icon-margin-end);
	}

	:where([data-sonner-toast][data-promise='true']) :where([data-icon] > svg) {
		opacity: 0;
		transform: scale(0.8);
		transform-origin: center;
		animation: sonner-fade-in 300ms ease forwards;
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-icon] > *) {
		flex-shrink: 0;
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-icon] svg) {
		margin-left: var(--toast-svg-margin-start);
		margin-right: var(--toast-svg-margin-end);
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-content]) {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-button]) {
		border-radius: 4px;
		padding-left: 8px;
		padding-right: 8px;
		height: 24px;
		font-size: 12px;
		color: var(--normal-bg);
		background: var(--normal-text);
		margin-left: var(--toast-button-margin-start);
		margin-right: var(--toast-button-margin-end);
		border: none;
		font-weight: 500;
		cursor: pointer;
		outline: none;
		display: flex;
		align-items: center;
		flex-shrink: 0;
		transition:
			opacity 400ms,
			box-shadow 200ms;
	}

	:where([data-sonner-toast][data-styled='true'])
		:where([data-button]:focus-visible) {
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
	}

	:where([data-sonner-toast][data-styled='true'])
		:where([data-button]:first-of-type) {
		margin-left: var(--toast-button-margin-start);
		margin-right: var(--toast-button-margin-end);
	}

	:where([data-sonner-toast][data-styled='true']) :where([data-cancel]) {
		color: var(--normal-text);
		background: rgba(0, 0, 0, 0.08);
	}

	:where([data-sonner-toaster][data-sonner-theme='dark'])
		:where([data-sonner-toast][data-styled='true'])
		:where([data-cancel]) {
		background: rgba(255, 255, 255, 0.3);
	}

	[data-sonner-toast][data-styled='true'] [data-close-button] {
		position: absolute;
		left: var(--toast-close-button-start);
		right: var(--toast-close-button-end);
		top: 0;
		height: 20px;
		width: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		color: var(--gray12);
		background: var(--normal-bg);
		border: 1px solid var(--gray4);
		transform: var(--toast-close-button-transform);
		border-radius: 50%;
		cursor: pointer;
		z-index: 1;
		transition:
			opacity 100ms,
			background 200ms,
			border-color 200ms;
	}

	:where([data-sonner-toast][data-styled='true'])
		:where([data-close-button]:focus-visible) {
		box-shadow:
			0px 4px 12px rgba(0, 0, 0, 0.1),
			0 0 0 2px rgba(0, 0, 0, 0.2);
	}

	:where([data-sonner-toast][data-styled='true'])
		:where([data-disabled='true']) {
		cursor: not-allowed;
	}

	:where([data-sonner-toast][data-styled='true'])
		:where([data-close-button]:hover) {
		background: var(--gray2);
		border-color: var(--gray5);
	}

	:where([data-sonner-toast][data-swiping='true'])::before {
		content: '';
		position: absolute;
		left: -100%;
		right: -100%;
		height: 100%;
		z-index: -1;
	}

	:where(
			[data-sonner-toast][data-y-position='top'][data-swiping='true']
		)::before {
		bottom: 50%;
		transform: scaleY(3) translateY(50%);
	}

	[data-sonner-toast][data-y-position='bottom'][data-swiping='true']::before {
		top: 50%;
		transform: scaleY(3) translateY(-50%);
	}

	:where(
			[data-sonner-toast][data-swiping='false'][data-removed='true']
		)::before {
		content: '';
		position: absolute;
		inset: 0;
		transform: scaleY(2);
	}

	:where([data-sonner-toast][data-expanded='true'])::after {
		content: '';
		position: absolute;
		left: 0;
		height: calc(var(--gap) + 1px);
		bottom: 100%;
		width: 100%;
	}

	:where([data-sonner-toast][data-mounted='true']) {
		--y: translateY(0);
		opacity: 1;
	}

	:where([data-sonner-toast][data-expanded='false'][data-front='false']) {
		--scale: var(--toasts-before) * 0.05 + 1;
		--y: translateY(calc(var(--lift-amount) * var(--toasts-before)))
			scale(calc(-1 * var(--scale)));
		height: var(--front-toast-height);
	}

	:where([data-sonner-toast]) > * {
		transition: opacity 400ms;
	}

	:where([data-sonner-toast][data-x-position='right']) {
		right: 0;
	}

	:where([data-sonner-toast][data-x-position='left']) {
		left: 0;
	}

	:where(
			[data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true']
		)
		> * {
		opacity: 0;
	}

	:where([data-sonner-toast][data-visible='false']) {
		opacity: 0;
		pointer-events: none;
	}

	:where([data-sonner-toast][data-mounted='true'][data-expanded='true']) {
		--y: translateY(calc(var(--lift) * var(--offset)));
		height: var(--initial-height);
	}

	:where(
		[data-sonner-toast][data-removed='true'][data-front='true'][data-swipe-out='false']
	) {
		--y: translateY(calc(var(--lift) * -100%));
		opacity: 0;
	}

	:where(
		[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='true']
	) {
		--y: translateY(
			calc(var(--lift) * var(--offset) + var(--lift) * -100%)
		);
		opacity: 0;
	}

	:where(
		[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='false']
	) {
		--y: translateY(40%);
		opacity: 0;
		transition:
			transform 500ms,
			opacity 200ms;
	}

	:where(
			[data-sonner-toast][data-removed='true'][data-front='false']
		)::before {
		height: calc(var(--initial-height) + 20%);
	}

	:where([data-sonner-toast][data-swiping='true']) {
		transform: var(--y) translateY(var(--swipe-amount-y, 0px))
			translateX(var(--swipe-amount-x, 0px));
		transition: none;
	}

	:where([data-sonner-toast][data-swiped='true']) {
		user-select: none;
	}

	:where(
		[data-sonner-toast][data-swipe-out='true'][data-y-position='bottom']
	),
	:where([data-sonner-toast][data-swipe-out='true'][data-y-position='top']) {
		animation-duration: 200ms;
		animation-timing-function: ease-out;
		animation-fill-mode: forwards;
	}

	:where(
		[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='left']
	) {
		animation-name: swipe-out-left;
	}

	:where(
		[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='right']
	) {
		animation-name: swipe-out-right;
	}

	:where(
		[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='up']
	) {
		animation-name: swipe-out-up;
	}

	:where(
		[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='down']
	) {
		animation-name: swipe-out-down;
	}

	@keyframes swipe-out-left {
		from {
			transform: var(--y) translateX(var(--swipe-amount-x));
			opacity: 1;
		}

		to {
			transform: var(--y) translateX(calc(var(--swipe-amount-x) - 100%));
			opacity: 0;
		}
	}

	@keyframes swipe-out-right {
		from {
			transform: var(--y) translateX(var(--swipe-amount-x));
			opacity: 1;
		}

		to {
			transform: var(--y) translateX(calc(var(--swipe-amount-x) + 100%));
			opacity: 0;
		}
	}

	@keyframes swipe-out-up {
		from {
			transform: var(--y) translateY(var(--swipe-amount-y));
			opacity: 1;
		}

		to {
			transform: var(--y) translateY(calc(var(--swipe-amount-y) - 100%));
			opacity: 0;
		}
	}

	@keyframes swipe-out-down {
		from {
			transform: var(--y) translateY(var(--swipe-amount-y));
			opacity: 1;
		}

		to {
			transform: var(--y) translateY(calc(var(--swipe-amount-y) + 100%));
			opacity: 0;
		}
	}

	@media (max-width: 600px) {
		[data-sonner-toaster] {
			position: fixed;
			right: var(--mobile-offset-right);
			left: var(--mobile-offset-left);
			width: 100%;
		}

		[data-sonner-toaster][dir='rtl'] {
			left: calc(var(--mobile-offset-left) * -1);
		}

		[data-sonner-toaster] [data-sonner-toast] {
			left: 0;
			right: 0;
			width: calc(100% - var(--mobile-offset-left) * 2);
		}

		[data-sonner-toaster][data-x-position='left'] {
			left: var(--mobile-offset-left);
		}

		[data-sonner-toaster][data-y-position='bottom'] {
			bottom: var(--mobile-offset-bottom);
		}

		[data-sonner-toaster][data-y-position='top'] {
			top: var(--mobile-offset-top);
		}

		[data-sonner-toaster][data-x-position='center'] {
			left: var(--mobile-offset-left);
			right: var(--mobile-offset-right);
			transform: none;
		}
	}

	:where([data-sonner-toaster][data-sonner-theme='light']) {
		--normal-bg: #fff;
		--normal-border: var(--gray4);
		--normal-text: var(--gray12);

		--success-bg: hsl(143, 85%, 96%);
		--success-border: hsl(145, 92%, 87%);
		--success-text: hsl(140, 100%, 27%);

		--info-bg: hsl(208, 100%, 97%);
		--info-border: hsl(221, 91%, 93%);
		--info-text: hsl(210, 92%, 45%);

		--warning-bg: hsl(49, 100%, 97%);
		--warning-border: hsl(49, 91%, 84%);
		--warning-text: hsl(31, 92%, 45%);

		--error-bg: hsl(359, 100%, 97%);
		--error-border: hsl(359, 100%, 94%);
		--error-text: hsl(360, 100%, 45%);
	}

	:where([data-sonner-toaster][data-sonner-theme='light'])
		:where([data-sonner-toast][data-invert='true']) {
		--normal-bg: #000;
		--normal-border: hsl(0, 0%, 20%);
		--normal-text: var(--gray1);
	}

	:where([data-sonner-toaster][data-sonner-theme='dark'])
		:where([data-sonner-toast][data-invert='true']) {
		--normal-bg: #fff;
		--normal-border: var(--gray3);
		--normal-text: var(--gray12);
	}

	:where([data-sonner-toaster][data-sonner-theme='dark']) {
		--normal-bg: #000;
		--normal-bg-hover: hsl(0, 0%, 12%);
		--normal-border: hsl(0, 0%, 20%);
		--normal-border-hover: hsl(0, 0%, 25%);
		--normal-text: var(--gray1);

		--success-bg: hsl(150, 100%, 6%);
		--success-border: hsl(147, 100%, 12%);
		--success-text: hsl(150, 86%, 65%);

		--info-bg: hsl(215, 100%, 6%);
		--info-border: hsl(223, 43%, 17%);
		--info-text: hsl(216, 87%, 65%);

		--warning-bg: hsl(64, 100%, 6%);
		--warning-border: hsl(60, 100%, 9%);
		--warning-text: hsl(46, 87%, 65%);

		--error-bg: hsl(358, 76%, 10%);
		--error-border: hsl(357, 89%, 16%);
		--error-text: hsl(358, 100%, 81%);
	}

	:where([data-sonner-toaster][data-sonner-theme='dark'])
		:where([data-sonner-toast])
		:where([data-close-button]) {
		background: var(--normal-bg);
		border-color: var(--normal-border);
		color: var(--normal-text);
	}

	:where([data-sonner-toaster][data-sonner-theme='dark'])
		:where([data-sonner-toast])
		:where([data-close-button]:hover) {
		background: var(--normal-bg-hover);
		border-color: var(--normal-border-hover);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='success'] {
		background: var(--success-bg);
		border-color: var(--success-border);
		color: var(--success-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='success']
		:where([data-close-button]) {
		background: var(--success-bg);
		border-color: var(--success-border);
		color: var(--success-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='info'] {
		background: var(--info-bg);
		border-color: var(--info-border);
		color: var(--info-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='info']
		:where([data-close-button]) {
		background: var(--info-bg);
		border-color: var(--info-border);
		color: var(--info-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='warning'] {
		background: var(--warning-bg);
		border-color: var(--warning-border);
		color: var(--warning-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='warning']
		:where([data-close-button]) {
		background: var(--warning-bg);
		border-color: var(--warning-border);
		color: var(--warning-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='error'] {
		background: var(--error-bg);
		border-color: var(--error-border);
		color: var(--error-text);
	}

	:where([data-rich-colors='true'])[data-sonner-toast][data-type='error']
		:where([data-close-button]) {
		background: var(--error-bg);
		border-color: var(--error-border);
		color: var(--error-text);
	}

	:where(.sonner-loading-wrapper) {
		--size: 16px;
		height: var(--size);
		width: var(--size);
		position: absolute;
		inset: 0;
		z-index: 10;
	}

	:where(.sonner-loading-wrapper[data-visible='false']) {
		transform-origin: center;
		animation: sonner-fade-out 0.2s ease forwards;
	}

	:where(.sonner-spinner) {
		position: relative;
		top: 50%;
		left: 50%;
		height: var(--size);
		width: var(--size);
	}

	:where(.sonner-loading-bar) {
		animation: sonner-spin 1.2s linear infinite;
		background: var(--gray11);
		border-radius: 6px;
		height: 8%;
		left: -10%;
		position: absolute;
		top: -3.9%;
		width: 24%;
	}

	:where(.sonner-loading-bar:nth-child(1)) {
		animation-delay: -1.2s;
		transform: rotate(0.0001deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(2)) {
		animation-delay: -1.1s;
		transform: rotate(30deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(3)) {
		animation-delay: -1s;
		transform: rotate(60deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(4)) {
		animation-delay: -0.9s;
		transform: rotate(90deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(5)) {
		animation-delay: -0.8s;
		transform: rotate(120deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(6)) {
		animation-delay: -0.7s;
		transform: rotate(150deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(7)) {
		animation-delay: -0.6s;
		transform: rotate(180deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(8)) {
		animation-delay: -0.5s;
		transform: rotate(210deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(9)) {
		animation-delay: -0.4s;
		transform: rotate(240deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(10)) {
		animation-delay: -0.3s;
		transform: rotate(270deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(11)) {
		animation-delay: -0.2s;
		transform: rotate(300deg) translate(146%);
	}

	:where(.sonner-loading-bar:nth-child(12)) {
		animation-delay: -0.1s;
		transform: rotate(330deg) translate(146%);
	}

	@keyframes sonner-fade-in {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes sonner-fade-out {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(0.8);
		}
	}

	@keyframes sonner-spin {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0.15;
		}
	}

	@media (prefers-reduced-motion) {
		[data-sonner-toast],
		[data-sonner-toast] > *,
		.sonner-loading-bar {
			transition: none !important;
			animation: none !important;
		}
	}

	:where(.sonner-loader) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transform-origin: center;
		transition:
			opacity 200ms,
			transform 200ms;
	}

	:where(.sonner-loader[data-visible='false']) {
		opacity: 0;
		transform: scale(0.8) translate(-50%, -50%);
	}
</style>
