<script lang="ts">
	import { toast } from '$lib/index.js';
	import type { Component } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';
	import Test from './Test.svelte';
	import TestWithProps from './TestWithProps.svelte';
	import { getOtherCodeSnippet } from './code-snippets.js';

	let {
		closeButton = $bindable(false),
		setRichColors = () => {}
	}: { closeButton?: boolean; setRichColors?: (bool: boolean) => void } =
		$props();

	const allTypes = [
		{
			name: 'Rich Colors Success',
			snippet: "toast.success('Event has been created')",
			action: () => {
				toast.success('Event has been created');
				setRichColors(true);
			}
		},
		{
			name: 'Rich Colors Error',
			snippet: "toast.error('Event has not been created')",
			action: () => {
				toast.error('Event has not been created');
				setRichColors(true);
			}
		},
		{
			name: 'Rich Colors Info',
			snippet: "toast.info('Info')",
			action: () => {
				toast.info('Be at the area 10 minutes before the event time');
				setRichColors(true);
			}
		},
		{
			name: 'Rich Colors Warning',
			snippet: "toast.warning('Warning')",
			action: () => {
				toast.warning('Event start time cannot be earlier than 8am');
				setRichColors(true);
			}
		},
		{
			name: 'Close buttons',
			snippet: `toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm',
  })`,
			action: () => {
				toast('Event has been created', {
					description: 'Monday, January 3rd at 6:00pm'
				});
				closeButton = !closeButton;
			}
		},
		{
			name: 'Headless',
			snippet: `import HeadlessToast from './HeadlessToast.svelte'

  toast.custom(HeadlessToast)

  // With props:
  toast.custom(HeadlessToast, {
    componentProps: {
      eventName: 'Louvre Museum'
    }
  })
  `,
			action: () => {
				toast.custom(Test as unknown as Component, {
					componentProps: {
						eventName: 'hello'
					}
				});
			}
		},
		{
			name: 'Custom with properties',
			snippet: `import TestWithProps from './TestWithProps.svelte'

  toast.warning(TestWithProps, {
    componentProps: {
      message: 'This is <br />multiline message',
    }
  })
  `,
			action: () => {
				// @ts-expect-error - TODO figure this out
				toast.warning(TestWithProps, {
					componentProps: {
						message: 'This is <br />multiline message'
					}
				});
			}
		}
	];

	let activeType = $state(allTypes[0]);

	const richColorsActive = $derived(
		activeType?.name?.includes('Rich') ?? false
	);
	const closeButtonActive = $derived(
		activeType?.name?.includes('Close') ?? false
	);
</script>

<div>
	<h2>Other</h2>
	<div class="buttons">
		{#each allTypes as type}
			<button
				class="button"
				data-testid={`other-${type.name}`}
				data-active={activeType?.name === type.name}
				onclick={() => {
					type.action?.();
					activeType = type;
				}}
			>
				{type.name}
				{#if type.name === 'Close buttons'}
					({closeButton ? 'Visible' : 'Hidden'})
				{/if}
			</button>
		{/each}
	</div>
	<CodeBlock
		code={getOtherCodeSnippet(
			activeType?.snippet ?? '',
			richColorsActive,
			closeButtonActive
		)}
		language="svelte"
	/>
</div>
