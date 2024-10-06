<script lang="ts">
	import { toast } from '$lib/index.js';
	import CodeBlock from './CodeBlock.svelte';

	let {
		expand,
		setExpand
	}: { expand: boolean; setExpand: (expand: boolean) => void } = $props();
</script>

<div>
	<h2>Expand</h2>
	<p>
		You can change the amount of toasts visible through the <code
			>visibleToasts</code
		> prop.
	</p>
	<div class="buttons">
		<button
			data-active={expand}
			class="button"
			onclick={() => {
				toast('Event has been created', {
					description: 'Monday, January 3rd at 6:00pm'
				});
				setExpand(true);
			}}
		>
			Expand
		</button>
		<button
			data-active={!expand}
			class="button"
			onclick={() => {
				toast('Event has been created', {
					description: 'Monday, January 3rd at 6:00pm'
				});
				setExpand(false);
			}}
		>
			Default
		</button>
	</div>
	<CodeBlock code={`<Toaster expand={${expand}} />`} />
</div>
