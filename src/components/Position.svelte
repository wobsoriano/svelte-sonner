<script lang="ts">
	import { toast } from '$lib';
	import { createEventDispatcher } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';

	const positions = [
		'top-left',
		'top-center',
		'top-right',
		'bottom-left',
		'bottom-center',
		'bottom-right'
	] as const;

	export let position: (typeof positions)[number];

	const dispatch = createEventDispatcher();
</script>

<div>
	<h2>Position</h2>
	<p>Swipe direction changes depending on the position.</p>
	<div class="buttons">
		{#each positions as pos}
			<button
				data-active={position === pos}
				class="button"
				on:click={() => {
					const toastsAmount = document.querySelectorAll(
						'[data-sonner-toast]'
					).length;
					dispatch('setPosition', pos);

					// No need to show a toast when there is already one
					if (toastsAmount > 0 && pos !== position) return;

					toast('Event has been created', {
						description: 'Monday, January 3rd at 6:00pm'
					});
				}}
			>
				{pos}
			</button>
		{/each}
	</div>
	<CodeBlock code={`<Toaster position="${position}" />`} />
</div>
