<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { ToastClassnames, ToastProps } from './types.js';
	import { toastState } from './toast-state.svelte.js';
	import { cn } from './internal/helpers.js';

	let {
		toast,
		index,
		expanded,
		invert: invertProp,
		position,
		visibleToasts,
		expandByDefault,
		closeButton,
		interacting,
		cancelButtonStyle = '',
		actionButtonStyle = '',
		duration,
		descriptionClass = '',
		classes: classesProp,
		unstyled = false,
		...restProps
	}: ToastProps = $props();

	// Default lifetime of a toasts (in ms)
	const TOAST_LIFETIME = 4000;

	// Default gap between toasts
	const GAP = 14;

	const SWIPE_THRESHOLD = 20;

	const TIME_BEFORE_UNMOUNT = 200;

	const SCALE_MULTIPLIER = 0.05;

	const defaultClasses: ToastClassnames = {
		toast: '',
		title: '',
		description: '',
		loader: '',
		closeButton: '',
		cancelButton: '',
		actionButton: '',
		action: '',
		warning: '',
		error: '',
		success: '',
		default: '',
		info: '',
		loading: ''
	};

	let mounted = $state(false);
	let removed = $state(false);
	let swiping = $state(false);
	let swipeOut = $state(false);
	let offsetBeforeRemove = $state(0);
	let initialHeight = $state(0);
	let toastRef = $state<HTMLLIElement>();

	const classes = $derived({ ...defaultClasses, ...classesProp });

	const isFront = $derived(index === 0);
	const isVisible = $derived(index + 1 <= visibleToasts);
	const toastTitle = $derived(toast.title);
	const toastDescription = $derived(toast.description);
	const toastType = $derived(toast.type);
	const toastClass = $derived(toast.class || '');
	const toastDescriptionClass = $derived(toast.descriptionClass || '');

	// height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
	const heightIndex = $derived(
		toastState.heights.findIndex((height) => height.toastId === toast.id) ||
			0
	);

	let closeTimerStartTime = $state(0);
	let lastCloseTimerStartTime = $state(0);

	let pointerStart = $state<{ x: number; y: number } | null>(null);

	const coords = $derived(position.split('-'));
	const toastsHeightBefore = $derived(
		toastState.heights.reduce((prev, curr, reducerIndex) => {
			if (reducerIndex >= heightIndex) return prev;
			return prev + curr.height;
		}, 0)
	);

	const invert = $derived(toast.invert || invertProp);
	const disabled = $derived(toastType === 'loading');

	const offset = $derived(Math.round(heightIndex * GAP + toastsHeightBefore));

	$effect(() => {
		toastTitle;
		toastDescription;
		let scale: number;

		if (expanded || expandByDefault) {
			scale = 1;
		} else {
			scale = 1 - index * SCALE_MULTIPLIER;
		}

		const toastEl = untrack(() => toastRef);
		if (toastEl === undefined) return;
		toastEl.style.setProperty('height', 'auto');

		const offsetHeight = toastEl.offsetHeight;
		const rectHeight = toastEl.getBoundingClientRect().height;
		const scaledRectHeight =
			Math.round((rectHeight / scale + Number.EPSILON) & 100) / 100;

		toastEl.style.removeProperty('height');

		let finalHeight: number;

		if (Math.abs(scaledRectHeight - offsetHeight) < 1) {
			// use scaledRectHeight as it's more precise
			finalHeight = scaledRectHeight;
		} else {
			// toast was transitioning its scale, so scaledRectHeight isn't accurate
			finalHeight = offsetHeight;
		}

		initialHeight = finalHeight;

		toastState.setHeight({ toastId: toast.id, height: finalHeight });
	});

	function deleteToast() {
		removed = true;
		// save the offset for the exit swipe animation
		offsetBeforeRemove = offset;

		toastState.removeHeight(toast.id);

		setTimeout(() => {
			toastState.remove(toast.id);
		}, TIME_BEFORE_UNMOUNT);
	}

	let timeoutId: ReturnType<typeof setTimeout>;
	let remainingTime = toast.duration || duration || TOAST_LIFETIME;

	const isPromiseLoadingOrInfiniteDuration = $derived(
		(toast.promise && toastType === 'loading') ||
			toast.duration === Number.POSITIVE_INFINITY
	);

	function startTimer() {
		closeTimerStartTime = new Date().getTime();
		// let the toast know it has started
		timeoutId = setTimeout(() => {
			toast.onAutoClose?.(toast);
			deleteToast();
		}, remainingTime);
	}

	function pauseTimer() {
		if (lastCloseTimerStartTime < closeTimerStartTime) {
			// get the elapsed time since the timer started
			const elapsedTime = new Date().getTime() - closeTimerStartTime;
			remainingTime = remainingTime - elapsedTime;
		}

		lastCloseTimerStartTime = new Date().getTime();
	}

	$effect(() => {
		if (toast.updated) {
			// if the toast has been updated after the initial render,
			// we want to reset the timer and set the remaining time to the
			// new duration
			clearTimeout(timeoutId);
			remainingTime = toast.duration || duration || TOAST_LIFETIME;
			startTimer();
		}
	});

	$effect(() => {
		if (!isPromiseLoadingOrInfiniteDuration) {
			if (expanded || interacting) {
				pauseTimer();
			} else {
				startTimer();
			}
		}

		return () => clearTimeout(timeoutId);
	});

	onMount(() => {
		mounted = true;

		const height = toastRef?.getBoundingClientRect().height as number;

		initialHeight = height;
		toastState.setHeight({ toastId: toast.id, height });

		return () => {
			toastState.removeHeight(toast.id);
		};
	});

	$effect(() => {
		if (toast.delete) {
			deleteToast();
		}
	});

	function onPointerDown(event: PointerEvent) {
		if (disabled) return;

		offsetBeforeRemove = offset;
		const target = event.target as HTMLElement;

		// ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
		target.setPointerCapture(event.pointerId);
		if (target.tagName === 'BUTTON') return;
		swiping = true;
		pointerStart = { x: event.clientX, y: event.clientY };
	}

	function onPointerUp() {
		if (swipeOut) return;

		pointerStart = null;
		const swipeAmount = Number(
			toastRef?.style
				.getPropertyValue('--swipe-amount')
				.replace('px', '') || 0
		);

		// remove only if threshold is met
		if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD) {
			offsetBeforeRemove = offset;
			toast.onDismiss?.(toast);
			deleteToast();
			swipeOut = true;
			return;
		}

		toastRef?.style.setProperty('--swipe-amount', '0px');
		swiping = false;
	}

	function onPointerMove(event: PointerEvent) {
		if (!pointerStart) return;

		const yPosition = event.clientY - pointerStart.y;
		const xPosition = event.clientX - pointerStart.x;

		const clamp = coords[0] === 'top' ? Math.min : Math.max;
		const clampedY = clamp(0, yPosition);
		const swipeStartThreshold = event.pointerType === 'touch' ? 10 : 2;
		const isAllowedToSwipe = Math.abs(clampedY) > swipeStartThreshold;

		if (isAllowedToSwipe) {
			toastRef?.style.setProperty('--swipe-amount', `${yPosition}px`);
		} else if (Math.abs(xPosition) > swipeStartThreshold) {
			// user is swiping in wrong direction so we disable swipe gesture
			// for the current pointer down interaction
			pointerStart = null;
		}
	}
</script>

<li
	bind:this={toastRef}
	aria-live={toast.important ? 'assertive' : 'polite'}
	aria-atomic="true"
	role="status"
	tabIndex={0}
	class={cn(
		restProps.class,
		toastClass,
		classes?.toast,
		toast?.classes?.toast,
		classes?.[toastType],
		toast?.classes?.[toastType]
	)}
	data-sonner-toast=""
	data-styled={!(toast.component || toast?.unstyled || unstyled)}
	data-mounted={mounted}
	data-promise={Boolean(toast.promise)}
	data-removed={removed}
	data-visible={isVisible}
	data-y-position={coords[0]}
	data-x-position={coords[1]}
	data-index={index}
	data-front={isFront}
	data-swiping={swiping}
	data-type={toastType}
	data-invert={invert}
	data-swipe-out={swipeOut}
	data-expanded={Boolean(expanded || (expandByDefault && mounted))}
	style={`${restProps.style} ${toast.style}`}
	style:--index={index}
	style:--toasts-before={index}
	style:--z-index={toastState.toasts.length - index}
	style:--offset={`${removed ? offsetBeforeRemove : offset}px`}
	style:--initial-height={`${initialHeight}px`}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointermove={onPointerMove}
>
	{#if closeButton && !toast.component}
		<button
			aria-label="Close toast"
			data-disabled={disabled}
			data-close-button
			onclick={() => {
				if (disabled) return;
				deleteToast();
				toast.onDismiss?.(toast);
			}}
			class={cn(classes?.closeButton, toast?.classes?.closeButton)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}

	{#if toast.component}
		{@const Component = toast.component}
		<Component {...toast.componentProps} closeToast={deleteToast} />
	{:else}
		{#if toastType !== 'default' || toast.icon || toast.promise}
			<div data-icon="">
				{#if (toast.promise || toastType === 'loading') && !toast.icon}
					{@render restProps.loadingIcon?.()}
				{/if}
				{#if toast.icon}
					{@const Icon = toast.icon}
					<Icon />
				{:else if toastType === 'success'}
					{@render restProps.successIcon?.()}
				{:else if toastType === 'error'}
					{@render restProps.errorIcon?.()}
				{:else if toastType === 'warning'}
					{@render restProps.warningIcon?.()}
				{:else if toastType === 'info'}
					{@render restProps.infoIcon?.()}
				{/if}
			</div>
		{/if}
		<div data-content="">
			{#if toast.title}
				<div
					data-title=""
					class={cn(classes?.title, toast?.classes?.title)}
				>
					{#if typeof toast.title !== 'string'}
						{@const Title = toast.title}
						<Title {...toast.componentProps} />
					{:else}
						{toast.title}
					{/if}
				</div>
			{/if}
			{#if toast.description}
				<div
					data-description=""
					class={cn(
						descriptionClass,
						toastDescriptionClass,
						classes?.description,
						toast.classes?.description
					)}
				>
					{#if typeof toast.description !== 'string'}
						{@const Description = toast.description}
						<Description {...toast.componentProps} />
					{:else}
						{toast.description}
					{/if}
				</div>
			{/if}
		</div>
		{#if toast.cancel}
			<button
				data-button
				data-cancel
				style={cancelButtonStyle}
				class={cn(classes?.cancelButton, toast?.classes?.cancelButton)}
				onclick={() => {
					deleteToast();
					toast.cancel?.onClick?.();
				}}
			>
				{toast.cancel.label}
			</button>
		{/if}
		{#if toast.action}
			<button
				data-button=""
				style={actionButtonStyle}
				class={cn(classes?.actionButton, toast?.classes?.actionButton)}
				onclick={(event) => {
					toast.action?.onClick(event);
					if (event.defaultPrevented) return;
					deleteToast();
				}}
			>
				{toast.action.label}
			</button>
		{/if}
	{/if}
</li>
