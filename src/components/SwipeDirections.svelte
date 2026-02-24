<script lang="ts">
	import { toast } from '$lib/index.js';
	import type {
		Position as PositionType,
		SwipeDirection
	} from '$lib/types.js';
	import CodeBlock from './CodeBlock.svelte';

	type SwipePreset = SwipeDirection[] | undefined;

	let {
		position,
		swipeDirections,
		setSwipeDirections
	}: {
		position: PositionType;
		swipeDirections: SwipePreset;
		setSwipeDirections: (swipeDirections: SwipePreset) => void;
	} = $props();

	const presets: Array<{ label: string; directions: SwipePreset }> = [
		{ label: 'Position default', directions: undefined },
		{ label: 'Horizontal', directions: ['left', 'right'] },
		{ label: 'Vertical', directions: ['top', 'bottom'] },
		{ label: 'Disabled', directions: [] }
	];

	function areDirectionsEqual(a: SwipePreset, b: SwipePreset) {
		if (a === undefined || b === undefined) return a === b;
		if (a.length !== b.length) return false;
		return a.every((direction, index) => direction === b[index]);
	}

	const snippet = $derived.by(() => {
		if (swipeDirections === undefined) {
			return `<Toaster position="${position}" />`;
		}

		if (swipeDirections.length === 0) {
			return `<Toaster position="${position}" swipeDirections={[]} />`;
		}

		return `<Toaster position="${position}" swipeDirections={['${swipeDirections.join("', '")}']} />`;
	});
</script>

<div>
	<h2>Swipe Directions</h2>
	<p>
		Defaults follow <code>position</code>; override with
		<code>swipeDirections</code> or disable with an empty array.
	</p>
	<div class="buttons">
		{#each presets as preset (preset.label)}
			<button
				class="button"
				data-active={areDirectionsEqual(swipeDirections, preset.directions)}
				onclick={() => {
					setSwipeDirections(preset.directions);
					toast('Event has been created', {
						description: 'Monday, January 3rd at 6:00pm'
					});
				}}
			>
				{preset.label}
			</button>
		{/each}
	</div>
	<CodeBlock code={snippet} />
</div>
