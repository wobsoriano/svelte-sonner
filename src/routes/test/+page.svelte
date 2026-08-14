<script lang="ts">
	import { page } from '$app/state';
	import { Toaster, toast } from '$lib/index.js';
	import type { Position, SwipeDirection } from '$lib/types.js';
	import CustomIcon from './CustomIcon.svelte';
	import WideDescription from './WideDescription.svelte';

	const params = page.url.searchParams;
	const position = (params.get('position') ?? 'bottom-right') as Position;
	const gap = params.has('gap') ? Number(params.get('gap')) : undefined;
	const swipeDirections = params.get('swipeDirections')?.split(',') as
		| SwipeDirection[]
		| undefined;
	const secondToaster = params.has('secondToaster');

	// Runs during component init, before the <Toaster /> below has mounted
	if (params.has('toastOnMount')) {
		toast('Toast rendered on mount');
	}

	function promiseWithCustomIcon() {
		toast.promise(new Promise((resolve) => setTimeout(resolve, 200)), {
			loading: 'Loading...',
			success: 'Loaded',
			icon: CustomIcon
		});
	}

	function dismissAndRecreate() {
		const id = toast('Original toast');
		toast.dismiss(id);
		// recreate while the exit-animation removal is still pending
		setTimeout(() => toast('Remounted toast', { id }), 100);
	}
</script>

<Toaster
	{position}
	{gap}
	{swipeDirections}
	toastOptions={{
		classes: {
			default: 'default-toast-classname',
			success: 'success-toast-classname'
		}
	}}
/>

{#if secondToaster}
	<Toaster id="secondary" position="top-left" />
{/if}

<main>
	<button
		data-testid="default-button"
		onclick={() => toast('My default toast')}
	>
		Default
	</button>
	<button
		data-testid="success"
		onclick={() => toast.success('My success toast')}
	>
		Success
	</button>
	<button data-testid="promise-custom-icon" onclick={promiseWithCustomIcon}>
		Promise with custom icon
	</button>
	<button data-testid="dismiss-and-recreate" onclick={dismissAndRecreate}>
		Dismiss and recreate
	</button>
	<button
		data-testid="component-description"
		onclick={() => toast('Custom title', { description: WideDescription })}
	>
		Wide description
	</button>
	<button
		data-testid="action"
		onclick={() =>
			toast('My message', {
				action: { label: 'Action', onClick: () => {} }
			})}
	>
		Action
	</button>
	<button
		data-testid="toast-to-secondary"
		onclick={() => toast('Secondary toast', { toasterId: 'secondary' })}
	>
		To secondary toaster
	</button>
</main>
