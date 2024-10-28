<script lang="ts">
	import { toast } from '$lib/index.js';
	import CodeBlock from './CodeBlock.svelte';

	const positions = [
		'top-left',
		'top-center',
		'top-right',
		'bottom-left',
		'bottom-center',
		'bottom-right'
	] as const;

	type PositionType = (typeof positions)[number];

	let {
		position,
		setPosition
	}: {
		position: PositionType;
		setPosition: (position: PositionType) => void;
	} = $props();
</script>

<div>
	<h2>Position</h2>
	<p>Swipe direction changes depending on the position.</p>
	<div class="buttons">
		{#each positions as pos}
			<button
				data-active={position === pos}
				class="button"
				onclick={() => {
					const toastsAmount = document.querySelectorAll(
						'[data-sonner-toast]'
					).length;
					setPosition(pos);

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
